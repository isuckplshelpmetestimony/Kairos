import json
import os
import sys
import threading
import time
import subprocess
from typing import Any, Dict, List

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd

from psgc_mapper import to_lamudi_province, is_supported
from src.adapters.lamudi_adapter import scrape_and_normalize

# -----------------------------------------------------------------------------
# Flask app setup
# -----------------------------------------------------------------------------
app = Flask(__name__)

# CORS: In production, restrict to configured origin via FRONTEND_ORIGIN env
frontend_origin = os.getenv("FRONTEND_ORIGIN", "*")
CORS(app, resources={r"/*": {"origins": frontend_origin}})

# Single-flight lock to serialize scrapes
_scrape_lock = threading.Lock()

# Paths
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BACKEND_DIR, "data")
OUTPUT_CSV = os.path.join(DATA_DIR, "output.csv")
SCRAPER_PATH = os.path.join(BACKEND_DIR, "lamudi_scraper.py")

# Config
MAX_COUNT = int(os.getenv("SCRAPER_MAX_COUNT", "100"))
SCRAPER_TIMEOUT_SEC = int(os.getenv("SCRAPER_TIMEOUT_SEC", "600"))


@app.get("/health")
def health() -> Any:
    return jsonify({"status": "ok"})


@app.post("/api/cma")
def cma() -> Any:
    if not request.is_json:
        return jsonify({"error": "Invalid content type"}), 400

    body = request.get_json(silent=True) or {}

    # Validate and sanitize input
    psgc_province_code = str(body.get("psgc_province_code", "")).strip()
    property_type = str(body.get("property_type", "")).strip().lower()
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

    # Enforce single-flight
    if not _scrape_lock.acquire(blocking=False):
        return jsonify({"error": "busy"}), 409

    start_time = time.time()
    try:
        # Clean previous output if exists
        try:
            if os.path.exists(OUTPUT_CSV):
                os.remove(OUTPUT_CSV)
        except Exception:
            # Non-fatal — continue, scraper will overwrite
            pass

        # Build stdin for the scraper: province, property_type, count
        stdin_payload = f"{province}\n{property_type}\n{count}\n".encode("utf-8")

        # Run scraper as subprocess with timeout and check
        proc = subprocess.run(
            [sys.executable, SCRAPER_PATH],
            input=stdin_payload,
            timeout=SCRAPER_TIMEOUT_SEC,
            check=True,
            cwd=BACKEND_DIR,
            capture_output=True,
        )
        # Log limited stdout/stderr for diagnosis (do not return to client)
        try:
            _stdout_tail = (proc.stdout or b"").decode("utf-8", errors="ignore")[-1000:]
            _stderr_tail = (proc.stderr or b"").decode("utf-8", errors="ignore")[-1000:]
            app.logger.info("scraper_stdout_tail: %s", _stdout_tail)
            app.logger.info("scraper_stderr_tail: %s", _stderr_tail)
        except Exception:
            pass

        # Read CSV output
        if not os.path.exists(OUTPUT_CSV):
            return jsonify({"error": "Scrape failed"}), 502

        df = pd.read_csv(OUTPUT_CSV)
        if df.empty:
            # Empty results are a valid outcome; return empty payload
            return jsonify({
                "properties": [],
                "stats": {"count": 0},
                "data_source": "live",
            })

        # Compute stats with preferred column order: price, then TCP, then amount
        price_col = None
        for cand in ["price", "TCP", "amount"]:
            if cand in df.columns:
                price_col = cand
                break

        stats: Dict[str, Any] = {"count": int(len(df))}
        if price_col:
            series = pd.to_numeric(df[price_col], errors="coerce").dropna()
            if len(series) > 0:
                stats.update({
                    "avg": float(series.mean()),
                    "median": float(series.median()),
                    "min": float(series.min()),
                    "max": float(series.max()),
                })

        # Prefer adapter-normalized properties in-memory; fallback to CSV rows
        properties: List[Dict[str, Any]]
        try:
            adapter_props, _ = scrape_and_normalize(province, property_type, count)
            properties = adapter_props if adapter_props else df.head(10).to_dict(orient="records")
        except Exception:
            properties = df.head(10).to_dict(orient="records")

        duration_ms = int((time.time() - start_time) * 1000)
        # Minimal observability (no raw CSV contents)
        app.logger.info(
            "scrape_done", extra={
                "province": province,
                "property_type": property_type,
                "count": count,
                "duration_ms": duration_ms,
                "exit_code": proc.returncode,
            }
        )

        return jsonify({
            "properties": properties,
            "stats": stats,
            "data_source": "live",
        })

    except subprocess.TimeoutExpired as e:
        app.logger.error("scraper_timeout", exc_info=False)
        return jsonify({"error": "Scrape timed out"}), 504
    except subprocess.CalledProcessError as e:
        try:
            _stdout_tail = (e.stdout or b"").decode("utf-8", errors="ignore")[-1000:]
            _stderr_tail = (e.stderr or b"").decode("utf-8", errors="ignore")[-1000:]
            app.logger.error("scraper_failed stdout=%s stderr=%s", _stdout_tail, _stderr_tail)
        except Exception:
            app.logger.error("scraper_failed (no stdout/stderr)")
        return jsonify({"error": "Scrape failed"}), 502
    except Exception as e:
        app.logger.error("server_error", exc_info=False)
        # Sanitized generic error
        return jsonify({"error": "Server error"}), 500
    finally:
        _scrape_lock.release()
        # Cleanup partial output if needed
        try:
            if os.path.exists(OUTPUT_CSV) and os.path.getsize(OUTPUT_CSV) == 0:
                os.remove(OUTPUT_CSV)
        except Exception:
            pass


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8000")), debug=False)
