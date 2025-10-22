import json
import os
import sys
import threading
import time
import subprocess
import requests
from typing import Any, Dict, List

# Add the current directory to Python path for local modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from collections import defaultdict, deque

from psgc_mapper import to_lamudi_province, is_supported
from src.adapters.lamudi_adapter import scrape_and_normalize
from supabase_client import update_appraisal, log_error

# -----------------------------------------------------------------------------
# Flask app setup
# -----------------------------------------------------------------------------
app = Flask(__name__)

# Add CORS - allow requests from frontend and mobile devices
CORS(app, resources={
    r"/api/*": {
        "origins": "*",  # Allow all origins for mobile compatibility
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
        "supports_credentials": False  # Set to False when using wildcard origins
    }
})

# Semaphore to limit concurrent scrapes (max 3 simultaneous)
_scrape_semaphore = threading.Semaphore(3)
_progress_lock = threading.Lock()
_scrape_progress: Dict[str, Any] = {"active": False, "pages_scanned": 0, "max_pages": None}

# Rate limiting for address search (100 requests per minute per IP)
_rate_limit_storage = defaultdict(deque)
_rate_limit_lock = threading.Lock()

# Simple cache for address search results (max 100 entries)
_address_cache = {}
_cache_lock = threading.Lock()

# Paths
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BACKEND_DIR, "data")
OUTPUT_CSV = os.path.join(DATA_DIR, "output.csv")
SCRAPER_PATH = os.path.join(BACKEND_DIR, "lamudi_scraper.py")
ADDRESS_DB_PATH = os.path.join(DATA_DIR, "philippine_addresses.json")

# Load address database once at startup
_address_database = None
try:
    with open(ADDRESS_DB_PATH, 'r', encoding='utf-8') as f:
        _address_database = json.load(f)
    app.logger.info(f"Loaded {len(_address_database.get('addresses', []))} addresses from database")
except Exception as e:
    app.logger.error(f"Failed to load address database: {e}")
    _address_database = {"addresses": []}

# Config
MAX_COUNT = int(os.getenv("SCRAPER_MAX_COUNT", "100"))
SCRAPER_TIMEOUT_SEC = int(os.getenv("SCRAPER_TIMEOUT_SEC", "600"))

# Scraper mode configuration
SCRAPER_MODE = os.getenv('SCRAPER_MODE', 'local')
SCRAPER_URL = os.getenv('SCRAPER_URL', 'http://localhost:3000')


def check_rate_limit(ip: str, max_requests: int = 100, window_seconds: int = 60) -> bool:
    """Check if IP has exceeded rate limit (100 requests per minute)."""
    current_time = time.time()
    
    with _rate_limit_lock:
        # Clean old requests outside the window
        while _rate_limit_storage[ip] and _rate_limit_storage[ip][0] < current_time - window_seconds:
            _rate_limit_storage[ip].popleft()
        
        # Check if under limit
        if len(_rate_limit_storage[ip]) >= max_requests:
            return False
        
        # Add current request
        _rate_limit_storage[ip].append(current_time)
        return True


def analyze_neighborhoods(properties: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Simple pandas-based neighborhood analysis following existing patterns."""
    if not properties:
        return {}
    
    try:
        df = pd.DataFrame(properties)
        df = df[df['neighborhood'].str.len() > 0]  # Filter empty neighborhoods
        df = df[df['price'] > 0]  # Filter zero prices
        
        if df.empty:
            return {}
        
        # Use pandas groupby like existing stats calculation
        grouped = df.groupby('neighborhood')['price'].agg(['count', 'mean', 'min', 'max'])
        grouped = grouped[grouped['count'] >= 2]  # Min 2 properties
        grouped = grouped.sort_values('count', ascending=False).head(20)
        
        return grouped.round(2).to_dict('index')
    except Exception:
        return {}


@app.get("/health")
def health() -> Any:
    return jsonify({"status": "ok"})
@app.get("/api/cma/status")
def cma_status() -> Any:
    """Lightweight polling endpoint to expose current scrape progress."""
    with _progress_lock:
        return jsonify({
            "active": bool(_scrape_progress.get("active", False)),
            "pagesScanned": int(_scrape_progress.get("pages_scanned") or 0),
            "maxPages": _scrape_progress.get("max_pages")
        })



@app.get("/api/addresses/search")
def search_addresses() -> Any:
    """Search Philippine addresses with PSGC codes and coordinates."""
    
    # Rate limiting check (100 requests per minute per IP)
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    if not check_rate_limit(client_ip):
        return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
    
    # Validate and sanitize input parameters
    query = request.args.get("q", "").strip()
    try:
        limit = int(request.args.get("limit", "5"))
    except (ValueError, TypeError):
        limit = 5
    
    # Input validation
    if not query or len(query) < 2:
        return jsonify({"error": "Query must be at least 2 characters"}), 400
    
    if len(query) > 100:
        return jsonify({"error": "Query too long"}), 400
    
    if limit < 1 or limit > 10:
        limit = 5
    
    start_time = time.time()
    
    # Check cache first
    cache_key = f"{query.lower()}:{limit}"
    with _cache_lock:
        if cache_key in _address_cache:
            cached_result = _address_cache[cache_key]
            # Return cached result with fresh timestamp
            cached_result["query_time_ms"] = int((time.time() - start_time) * 1000)
            return jsonify(cached_result)
    
    try:
        # Perform case-insensitive search with early termination
        lower_query = query.lower()
        addresses = _address_database.get("addresses", [])
        
        # Filter addresses that match the query with early termination
        matches = []
        for address in addresses:
            if lower_query in address["full_address"].lower():
                matches.append(address)
                # Early termination if we have enough high-confidence matches
                if len(matches) >= limit * 3:  # Get 3x limit for better sorting
                    break
        
        # Sort by confidence level (high > medium > low) and limit results
        confidence_order = {"high": 3, "medium": 2, "low": 1}
        matches.sort(key=lambda x: confidence_order.get(x["confidence_level"], 0), reverse=True)
        suggestions = matches[:limit]
        
        query_time_ms = int((time.time() - start_time) * 1000)
        
        response = {
            "suggestions": suggestions,
            "total": len(suggestions),
            "query_time_ms": query_time_ms
        }
        
        # Cache the result (limit cache to 100 entries)
        with _cache_lock:
            if len(_address_cache) >= 100:
                # Remove oldest entry (simple FIFO)
                oldest_key = next(iter(_address_cache))
                del _address_cache[oldest_key]
            _address_cache[cache_key] = response.copy()
        
        return jsonify(response)
        
    except Exception as e:
        app.logger.error(f"Address search error: {e}", exc_info=False)
        return jsonify({"error": "Search failed"}), 500


@app.post("/api/cma")
def cma() -> Any:
    if not request.is_json:
        return jsonify({"error": "Invalid content type"}), 400

    body = request.get_json(silent=True) or {}

    # Validate and sanitize input
    psgc_province_code = str(body.get("psgc_province_code", "")).strip()
    property_type = str(body.get("property_type", "")).strip().lower()
    appraisal_id = body.get("appraisal_id")
    try:
        count = int(body.get("count", 50))
    except Exception:
        return jsonify({"error": "Invalid count"}), 400

    if not psgc_province_code or len(psgc_province_code) > 8:
        return jsonify({"error": "Invalid PSGC code"}), 400

    if property_type != "condo":
        return jsonify({"error": "Unsupported property_type"}), 400

    if count < 1:
        count = 1
    if count > MAX_COUNT:
        count = MAX_COUNT

    if not is_supported(psgc_province_code):
        return jsonify({"error": "Unsupported province"}), 400

    province = to_lamudi_province(psgc_province_code)
    if not province:
        return jsonify({"error": "Unsupported province"}), 400

    # ===== Remote mode check =====
    if SCRAPER_MODE == 'remote':
        app.logger.info(f"Remote mode: Forwarding scrape request to {SCRAPER_URL}")
        try:
            response = requests.post(
                f"{SCRAPER_URL}/api/cma",
                json=body,
                headers={'Content-Type': 'application/json'},
                timeout=SCRAPER_TIMEOUT_SEC
            )
            
            if response.status_code == 200:
                app.logger.info("Remote scraper completed successfully")
            else:
                app.logger.warning(f"Remote scraper returned status {response.status_code}")
            
            return jsonify(response.json()), response.status_code
            
        except requests.Timeout:
            app.logger.error("Remote scraper timeout")
            return jsonify({"error": "Scraper timeout"}), 504
        except requests.ConnectionError as e:
            app.logger.error(f"Cannot connect to remote scraper: {e}")
            return jsonify({"error": "Scraper service unavailable"}), 503
        except Exception as e:
            app.logger.error(f"Remote scraper error: {e}")
            return jsonify({"error": "Scraper error"}), 500
    # ===== End remote mode check =====

    # LOCAL MODE: Allow concurrent scrapes with semaphore
    if not _scrape_semaphore.acquire(blocking=False):
        return jsonify({"error": "Server busy, please try again in a moment"}), 429

    start_time = time.time()
    try:
        # Initialize progress for this run
        with _progress_lock:
            _scrape_progress.update({"active": True, "pages_scanned": 0, "max_pages": None})

        # Clean previous output if exists
        try:
            if os.path.exists(OUTPUT_CSV):
                os.remove(OUTPUT_CSV)
        except Exception:
            # Non-fatal — continue, scraper will overwrite
            pass

        # Build stdin for the scraper: province, property_type, count
        stdin_payload = f"{province}\n{property_type}\n{count}\n".encode("utf-8")

        # Run scraper as subprocess and parse stdout to update progress
        proc = subprocess.Popen(
            [sys.executable, SCRAPER_PATH],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=BACKEND_DIR,
            text=True,
            bufsize=1,
            env={**os.environ, "TQDM_DISABLE": "1"},
        )
        assert proc.stdin is not None and proc.stdout is not None
        proc.stdin.write(stdin_payload.decode("utf-8"))
        proc.stdin.close()

        _stdout_tail_lines: List[str] = []
        _stderr_tail = ""
        import re as _re
        start_read = time.time()
        while True:
            line = proc.stdout.readline()
            if not line:
                if proc.poll() is not None:
                    break
                # Prevent tight loop
                time.sleep(0.05)
                continue
            # keep small tail for logs
            _stdout_tail_lines.append(line)
            if len(_stdout_tail_lines) > 200:
                _stdout_tail_lines.pop(0)
            # parse progress indicators
            if "list_pages_scanned" in line:
                m = _re.search(r"pages_scanned\'?:\s*(\d+)", line)
                if m:
                    with _progress_lock:
                        _scrape_progress["pages_scanned"] = int(m.group(1))
                m2 = _re.search(r"capped_max_page_num\'?:\s*(\d+)", line)
                if m2:
                    with _progress_lock:
                        _scrape_progress["max_pages"] = int(m2.group(1))
            # basic timeout check
            if time.time() - start_read > SCRAPER_TIMEOUT_SEC:
                proc.kill()
                raise subprocess.TimeoutExpired(SCRAPER_PATH, SCRAPER_TIMEOUT_SEC)

        # Collect remaining stderr for diagnostics
        try:
            _stderr_tail = (proc.stderr.read() or "")[-1000:]
        except Exception:
            _stderr_tail = ""
        _stdout_tail = "".join(_stdout_tail_lines)[-1000:]
        app.logger.info("scraper_stdout_tail: %s", _stdout_tail)
        if _stderr_tail:
            app.logger.info("scraper_stderr_tail: %s", _stderr_tail)
        pages_scanned = _scrape_progress.get("pages_scanned")

        # Prefer adapter-normalized in-memory data; keep CSV for diagnostics only
        properties: List[Dict[str, Any]] = []
        price_series: List[float] = []
        try:
            properties, price_series = scrape_and_normalize(province, property_type, count)
        except Exception:
            properties, price_series = [], []

        # Read CSV as a fallback check/diagnostic (do not block response)
        df = None
        try:
            if os.path.exists(OUTPUT_CSV):
                df = pd.read_csv(OUTPUT_CSV)
        except Exception:
            df = None

        # Compute stats from adapter price series
        stats: Dict[str, Any] = {"count": int(len(price_series))}
        if len(price_series) > 0:
            series = pd.to_numeric(pd.Series(price_series), errors="coerce").dropna()
            if len(series) > 0:
                stats.update({
                    "avg": float(series.mean()),
                    "median": float(series.median()),
                    "min": float(series.min()),
                    "max": float(series.max()),
                })

        # On empty, return current empty payload with optional meta.reason
        if not properties:
            response: Dict[str, Any] = {
                "properties": [],
                "stats": {"count": 0},
                "neighborhoods": {},
                "data_source": "live",
            }
            # Provide a small non-breaking reason when available
            response["meta"] = {"reason": "selector_miss"}
            duration_ms = int((time.time() - start_time) * 1000)
            try:
                app.logger.warning(
                    "cma_empty",
                    extra={
                        "province": province,
                        "property_type": property_type,
                        "count": count,
                        "duration_ms": duration_ms,
                        "properties_len": 0,
                        "stats_count": 0,
                        "reason": response["meta"]["reason"],
                        **({"pages_scanned": pages_scanned} if 'pages_scanned' in locals() and pages_scanned is not None else {}),
                    },
                )
            except Exception:
                pass
            return jsonify(response)

        # Cap properties to 100 for response parity
        if len(properties) > 100:
            properties = properties[:100]

        # Analyze neighborhoods
        neighborhoods = analyze_neighborhoods(properties)

        # Update Supabase with successful completion
        if appraisal_id:
            try:
                update_appraisal(
                    appraisal_id,
                    "completed",
                    completed_at=time.strftime("%Y-%m-%d %H:%M:%S%z"),
                    properties_found=len(properties),
                    duration_minutes=int(duration_ms / 60000)
                )
            except Exception as e:
                app.logger.error(f"Failed to update Supabase appraisal {appraisal_id}: {e}")

        # Successful response using adapter results
        duration_ms = int((time.time() - start_time) * 1000)
        try:
            app.logger.info(
                "cma_success",
                extra={
                    "province": province,
                    "property_type": property_type,
                    "count": count,
                    "duration_ms": duration_ms,
                    "properties_len": len(properties),
                    "stats_count": stats.get("count", 0),
                    **({"pages_scanned": pages_scanned} if 'pages_scanned' in locals() and pages_scanned is not None else {}),
                },
            )
        except Exception:
            pass
        return jsonify({
            "properties": properties,
            "stats": stats,
            "neighborhoods": neighborhoods,
            "data_source": "live",
        })

    except subprocess.TimeoutExpired as e:
        app.logger.error("scraper_timeout", exc_info=False)
        
        # Update Supabase with timeout error
        if appraisal_id:
            try:
                update_appraisal(
                    appraisal_id,
                    "failed",
                    error_type="timeout",
                    error_message="Scrape timed out"
                )
                # Get user_id from appraisal record for error logging
                # For now, we'll skip the detailed error logging since we don't have user_id
            except Exception as supabase_error:
                app.logger.error(f"Failed to update Supabase on timeout: {supabase_error}")
        
        return jsonify({"error": "Scrape timed out"}), 504
    except subprocess.CalledProcessError as e:
        try:
            _stdout_tail = (e.stdout or b"").decode("utf-8", errors="ignore")[-1000:]
            _stderr_tail = (e.stderr or b"").decode("utf-8", errors="ignore")[-1000:]
            app.logger.error("scraper_failed stdout=%s stderr=%s", _stdout_tail, _stderr_tail)
            
            # Update Supabase with scraper error
            if appraisal_id:
                try:
                    update_appraisal(
                        appraisal_id,
                        "failed",
                        error_type="scraper_error",
                        error_message="Scrape failed"
                    )
                except Exception as supabase_error:
                    app.logger.error(f"Failed to update Supabase on scraper error: {supabase_error}")
        except Exception:
            app.logger.error("scraper_failed (no stdout/stderr)")
        return jsonify({"error": "Scrape failed"}), 502
    except Exception as e:
        app.logger.error("server_error", exc_info=False)
        
        # Update Supabase with server error
        if appraisal_id:
            try:
                update_appraisal(
                    appraisal_id,
                    "failed",
                    error_type="server_error",
                    error_message="Server error"
                )
            except Exception as supabase_error:
                app.logger.error(f"Failed to update Supabase on server error: {supabase_error}")
        
        # Sanitized generic error
        return jsonify({"error": "Server error"}), 500
    finally:
        _scrape_semaphore.release()
        with _progress_lock:
            _scrape_progress["active"] = False
        # Cleanup partial output if needed
        try:
            if os.path.exists(OUTPUT_CSV) and os.path.getsize(OUTPUT_CSV) == 0:
                os.remove(OUTPUT_CSV)
        except Exception:
            pass


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8000")), debug=False)
