## Data Scraping — Lamudi (Kairos Backend)

### Objectives achieved
- Keep UI/UX and `/api/cma` response contract unchanged
- Prefer in‑memory adapter results; keep CSV diagnostics
- Improve coverage: capped mini‑crawl + minimal detail fallbacks
- Add lightweight observability with no PII

### Key backend edits
1) List pages robustness (`backend/src/scraper/scraper.py`)
- Session headers + `timeout=15s`; breadth crawl only
- Pagination detection: container attr, then `?page=` fallback
- Soft cap via `SCRAPER_MAX_PAGES` (default 10; env‑tunable)
- Early stop when requested `count` links collected
- Primary selectors kept; always run attribute/URL fallback too
- Merge primary+fallback candidates per page; de‑dup via SKU
- Observability: logs `pages_scanned` and `candidates_on_page`

2) Detail pages fallbacks (`scraper.py`)
- Keep primary class selectors
- Fallbacks (only on miss):
  - price: `[data-price]` or numeric near `Title-pdp-price`
  - floor area: `[data-floor-area]` or `N m²` token
  - bedrooms: `[data-bedrooms]` or `N Bedrooms`
  - baths: `[data-bathrooms]/[data-baths]` or `N Baths`sdfwd
- SKU fallback: derive from detail URL if `data-sku` absent
- Jitter 0.3–0.8s between detail requests

3) Normalization adapter (`backend/src/adapters/lamudi_adapter.py`)
- Contract owner; maps to canonical fields
- `coordinates=None` when missing
- Price coercion hardened; types sanitized
- Returned `properties` now capped at 100 (was 10→50→100)
- `price_series` kept full for stats

4) API orchestration (`backend/app.py`)
- Single‑flight lock; CSV kept for diagnostics only
- Prefer adapter in‑memory results; compute stats from price_series
- Logs: `cma_success` and `cma_empty` with allowed fields; optional `pages_scanned` parsed from scraper stdout; no PII
- Response remains: `{ properties, stats, data_source }` (+optional `meta.reason` on empty)

5) Config & deployment
- `SCRAPER_MAX_PAGES` default 10; `SCRAPER_MAX_COUNT` and `SCRAPER_TIMEOUT_SEC` honored
- `render.yaml` sets defaults; `FRONTEND_ORIGIN` kept for CORS

6) Testing & verification
- Unit test: adapter mapping (+ added check for missing coordinates → None)
- Manual checks:
  - CLI: `python backend/lamudi_scraper.py` → verify CSV with TCP
  - API: curl POST `/api/cma` for PSGC 1376/3400 with `count` up to 50/100
  - UI sanity: run frontend, generate reports; response cap honored

### Bug fixes & safety improvements
- Fixed variable shadowing (`num`) in pagination fallback
- De‑duplication narrowed to SKU only to avoid collapsing rows
- Safe sanitization of adapter fields (SKU/Location/Source strings)
- Removed `raw_data` from response payload

### What you’ll see in logs (examples)
- `list_page_candidates`: `page`, `candidates_on_page`
- `list_pages_scanned`: `pages_scanned`, `capped_max_page_num`, `requested_num`, `collected_links`
- `cma_success` / `cma_empty`: `province`, `property_type`, `count`, `duration_ms`, `properties_len`, `stats_count`, optional `pages_scanned`

### Current limits & how to increase results
- The breadth crawl scans pages `1..min(detected_max, SCRAPER_MAX_PAGES)`
- If Lamudi exposes only 2 pages for a query, results will top out around the unique links on those pages (e.g., ~31)
- To see higher counts: use broader geography/filters that yield more pages; set `SCRAPER_MAX_PAGES` higher if needed; increase `count`

### Guardrails respected
- No new deps/headless; same host only; no depth > 1
- Secure inputs; safe logging; no PII
- Single small adapter module; pure functions, type hints
- Response contract stable; UI unaffected

### Quick runbook
- Backend (local):
  - `pkill -f "python3 app.py" || true`
  - `cd backend && SCRAPER_MAX_PAGES=10 PORT=3000 python3 app.py`
- Frontend (local):
  - `cd Kairos && npm run dev -- --port 3001`
- API test:
  - `curl -s -X POST http://localhost:3000/api/cma -H "Content-Type: application/json" -d '{"psgc_province_code":"1376","property_type":"condo","count":50}' | jq`

### Outcome snapshot
- After fixes, one run scanned 2 pages, collected 31 links, and returned 31 normalized properties (cap now 100) when available.


