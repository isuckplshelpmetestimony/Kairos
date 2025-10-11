# KAIROS DEVELOPMENT GUARDRAILS

**Purpose:** Comprehensive guardrails and context engineering rules for Kairos real estate CMA platform development

**Created:** December 2024  
**Context:** Accumulated guardrails from address autocomplete, scraper integration, and single-server implementation phases  
**Maintainer:** Kairos Development Team

---

## **TABLE OF CONTENTS**

1. [Backend API Address Autocomplete Context Engineering](#backend-api-address-autocomplete-context-engineering)
2. [Backend Scraper Integration Context Engineering](#backend-scraper-integration-context-engineering)
3. [Single-Server Implementation Guardrails](#single-server-implementation-guardrails)
4. [Common Mistakes Prevention](#common-mistakes-prevention)
5. [Critical Cursor Rules](#critical-cursor-rules)
6. [Design System Protection Guardrails](#design-system-protection-guardrails)
7. [Inline Toggle & Comparisons Dropdown Design Guardrails](#inline-toggle--comparisons-dropdown-design-guardrails)
8. [DataTable Modal Implementation Guardrails](#datatable-modal-implementation-guardrails)
9. [CMA Summary Table Implementation Guardrails](#cma-summary-table-implementation-guardrails)

---

## **BACKEND API ADDRESS AUTOCOMPLETE CONTEXT ENGINEERING**

### **1. INTEGRATION CONSTRAINT LAYER**

**What it means:** *Tells Cursor that ph-address runs on your Hetzner server, not in the user's browser.*

```
PH_ADDRESS_BACKEND_INTEGRATION_CONTEXT:
"Building ph-address autocomplete for Kairos with backend API approach:
- ph-address runs on HETZNER BACKEND as Node.js service with SQLite
- Frontend makes API calls to /api/addresses/search endpoint
- SQLite database stays on server where it belongs
- Client gets lightweight JSON responses (not full database)
- Structured output feeds CMA scraper targeting
- Direct implementation: Real API from day one, no mock phases"
```

### **2. DATA FLOW SECURITY CONTEXT**

**What it means:** *Protects your address API from abuse while keeping user searches private.*

```
ADDRESS_API_SECURITY_CONTEXT:
"Backend ph-address API requires security controls:
- Rate limiting: 100 requests per minute per IP
- Input validation: Sanitize all search queries
- No logging of user search terms (privacy protection)
- CORS configured for Netlify frontend only
- API responses contain no sensitive server information
- Structured PSGC output prevents injection attacks on scraper params"
```

### **3. INTEGRATION PATTERN ENFORCEMENT**

**What it means:** *Forces Cursor to follow the exact API-based flow for address selection.*

```
API_AUTOCOMPLETE_PATTERN_CONTEXT:
"Must implement this exact integration pattern:
1. User types → Frontend debounces → API call to /api/addresses/search
2. Backend ph-address processes → Returns structured suggestions
3. User selects → Frontend creates location object with PSGC codes
4. Structured object feeds scraper parameters (NOT raw user input)
5. Backend receives clean, validated geographic data for CMA generation"
```

### **4. PERFORMANCE CONSTRAINT CONTEXT**

**What it means:** *Ensures the API-based autocomplete still feels fast despite network calls.*

```
API_PERFORMANCE_CONTEXT:
"API autocomplete must feel responsive (<300ms total):
- Frontend debouncing: 300ms delay before API call
- Backend response time: <100ms for address searches
- Cache common searches in browser localStorage
- Limit API responses to top 5 matches
- Show loading states during network requests
- Fallback to cached results if API temporarily unavailable"
```

### **5. CURSOR ARCHITECTURAL GUARDRAILS**

#### **MINIMAL TECHNICAL DEBT GUARDRAIL**

**What it means:** *Prevents Cursor from building complex API logic when simple REST endpoints work.*

```
ROLE: Backend API Integration Architect
CONSTRAINT: Simple REST API pattern - no GraphQL, no WebSockets
REQUIREMENT: Single /api/addresses/search endpoint with clear interface
PATTERN: Express.js route that calls ph-address and returns JSON
ANTI-PATTERN: Do NOT create complex API gateway or microservices architecture
```

#### **NO MAJOR FUCKUPS GUARDRAIL**

**What it means:** *Ensures the address API works reliably even with network issues or server problems.*

```
API_SAFETY_CONTEXT:
"ph-address API integration MUST NOT break if:
- Network requests timeout or fail
- Backend server is temporarily unavailable
- User types invalid or incomplete addresses
- SQLite database is locked or corrupted
FALLBACK: Frontend caches recent searches, graceful error messages, retry logic"
```

#### **SECURITY GUARDRAIL**

**What it means:** *Protects both your API and user privacy from attacks and data exposure.*

```
API_SECURITY_REQUIREMENTS:
"Backend address API security checklist:
- Rate limiting to prevent abuse (100 req/min per IP)
- Input sanitization to prevent SQL injection
- CORS whitelist for Netlify domain only
- No logging of user search queries (privacy)
- Error responses don't expose server details
- API key authentication for production deployment"
```

#### **FUTURE-PROOF API GUARDRAIL**

**What it means:** *Guarantees your API returns data in exactly the format your CMA system expects.*

```
STRUCTURED_API_OUTPUT_REQUIREMENT:
"Address search API must return this exact structure:
GET /api/addresses/search?q=bgc&limit=5
Response: {
  suggestions: [
    {
      full_address: string,
      psgc_city_code: string,
      psgc_province_code: string,
      coordinates: [lat, lng],
      search_radius_km: number,
      confidence_level: 'high' | 'medium' | 'low'
    }
  ],
  total: number,
  query_time_ms: number
}
This feeds directly into CMA generation pipeline."
```

### **6. SPECIALIZED CURSOR SESSION PROMPTS**

#### **FRONTEND COMPONENT PROMPT**

**What it means:** *Instructions for building the React component that calls your address API.*

```
FRONTEND_SESSION_CONTEXT: Building API-based AddressInput component for Kairos

ROLE: React Frontend Developer specializing in API integration
TASK: Create AddressInput component that calls backend ph-address API
CONSTRAINT: Must handle network latency and errors gracefully

REQUIREMENTS:
1. Create AddressInput component with debounced API calls (300ms)
2. Show loading states during network requests
3. Cache successful searches in localStorage
4. Handle network errors with retry logic
5. Output structured location data when address selected

API_INTEGRATION_REALITY:
- Calls GET /api/addresses/search?q={query}&limit=5
- Handles 300ms network latency gracefully
- Shows loading spinner during requests
- Caches results to reduce API calls
- Fallback to manual input if API fails

PERFORMANCE: Feel responsive despite network calls
ERROR_HANDLING: Clear error messages, retry buttons, offline fallback
CACHING: localStorage for common searches, respect cache expiry

Please build the AddressInput component with API integration and error handling.
```

#### **BACKEND API PROMPT**

**What it means:** *Instructions for building the Node.js API service on your Hetzner server.*

```
BACKEND_SESSION_CONTEXT: Building ph-address API service for Kairos backend

ROLE: Node.js Backend Developer specializing in address search APIs
TASK: Create Express.js API that integrates kosinix/ph-address with SQLite
CONSTRAINT: Must be secure, fast, and reliable for production use

REQUIREMENTS:
1. Install kosinix/ph-address in Hetzner backend environment
2. Create GET /api/addresses/search endpoint with rate limiting
3. Initialize SQLite database with Philippine address data
4. Return structured JSON matching frontend expectations
5. Add comprehensive error handling and logging

API_SPECIFICATIONS:
- Endpoint: GET /api/addresses/search?q={query}&limit={number}
- Response time: <100ms for typical searches
- Rate limiting: 100 requests per minute per IP
- CORS: Allow Netlify frontend domain only
- Error handling: Graceful degradation, no server details exposed

SECURITY_REQUIREMENTS:
- Input sanitization for all query parameters
- Rate limiting middleware (express-rate-limit)
- CORS configuration for production
- No logging of user search queries
- Proper error responses without server details

Please build the complete address search API with ph-address integration.
```

---

## **BACKEND SCRAPER INTEGRATION CONTEXT ENGINEERING**

### **1. INTEGRATION CONSTRAINT LAYER**

**What it means:** *The scraper runs server-side only and is triggered via a thin API.*

```
LAMUDI_SCRAPER_BACKEND_CONTEXT:
"Lamudi scraper runs on BACKEND (Render Web Service) as a Python process:
- Frontend calls POST /api/cma with structured PSGC parameters
- Backend maps PSGC → Lamudi province string (e.g., '1376' → 'metro-manila')
- Scraper executes via subprocess with stdin input (v1) and writes CSV
- Backend computes stats and returns small JSON payload to client
- No scraping logic, CSV, or secrets ever reach the browser"
```

### **2. DATA FLOW SECURITY CONTEXT**

**What it means:** *Only sanitized, structured inputs drive the scraper; no raw text.*

```
SCRAPER_DATA_SECURITY_CONTEXT:
"Structured scraper input only:
- Accept JSON: { psgc_province_code: string, property_type: 'condo', count: number }
- Validate types, clamp count to safe max (e.g., 100)
- Translate PSGC to known whitelist of provinces; reject unknowns
- Never accept raw free-text location strings
- Error messages sanitized (no stack traces, commands, or server details)"
```

### **3. INTEGRATION PATTERN ENFORCEMENT**

**What it means:** *Enforce the exact end-to-end flow from selection to stats.*

```
SCRAPER_PATTERN_CONTEXT:
"Integration pattern MUST be:
1) User selects address → emits KairosAddressOutput with PSGC codes
2) Frontend POSTs minimal JSON to /api/cma
3) Backend maps PSGC → Lamudi province, runs scraper
4) Backend parses CSV → computes { count, avg, median, min, max }
5) Backend returns { properties: top 10, stats } JSON
6) Frontend renders stats; raw CSV never leaves server"
```

### **4. PERFORMANCE CONSTRAINT CONTEXT**

**What it means:** *Long tasks must feel accountable and bounded.*

```
SCRAPER_PERFORMANCE_CONTEXT:
"Scrapes may take 5–10 minutes:
- Frontend shows persistent 'Scraping live data...' state
- Backend enforces timeout (≤10 minutes) and returns clear failure
- Single-flight policy: if scraper busy, respond 409 { error: 'busy' }
- Reject overlapping runs; no queue in v1 to avoid complexity"
```

### **5. MINIMAL TECHNICAL DEBT GUARDRAIL**

**What it means:** *Keep v1 thin; defer heavy architecture.*

```
SCRAPER_MINIMALISM_GUARDRAIL:
- No job queues, no background workers, no databases in v1
- Single Flask app, single POST endpoint, single threading.Lock
- Use stdin-based scraper (no forking the OSS repo) for v1
- Compute stats server-side; return compact JSON only
- Add complexity only after demo feedback
```

### **6. SAFETY/RESILIENCE GUARDRAIL**

**What it means:** *Fail fast, fail clear, and never corrupt outputs.*

```
SCRAPER_SAFETY_CONTEXT:
"Safety rules:
- Use process timeout and check=True; catch CalledProcessError
- If busy lock held → 409 with human-readable message
- If CSV missing/invalid → 502 with 'Scrape failed' (no internals)
- Always clean up partial results; never return inconsistent stats"
```

### **7. SECURITY GUARDRAIL**

**What it means:** *Basic production hygiene from day one.*

```
SCRAPER_SECURITY_REQUIREMENTS:
- CORS: allow only configured frontend origin in production
- Input validation: types, length caps, whitelist provinces
- Rate limiting (basic IP throttling) when enabling public access
- Secure headers; disable debug; hide stack traces
- No secrets in client; use env vars for config
```

### **8. FUTURE-PROOF OUTPUT CONTRACT**

**What it means:** *Keep the response stable for later data-source swaps.*

```
SCRAPER_OUTPUT_CONTRACT:
"POST /api/cma
Request: { psgc_province_code: string, property_type: 'condo', count?: number }
Response: {
  properties: Array<Record<string, any>>  // top 10
  stats: { count: number, avg: number, median: number, min: number, max: number }
  data_source?: 'live' | 'demo'
}
Contract must remain stable when switching to official API"
```

### **9. FRONTEND SESSION CONTEXT (Kairos UI)**

**What it means:** *Minimal UI changes, clear long-running feedback.*

```
FRONTEND_SCRAPER_SESSION_CONTEXT:
- Reuse existing AddressInput; require selectedAddress before POST
- Show 'Scraping live data (5–10 minutes)...' and disable button
- Handle 409 'busy' with friendly retry guidance
- Render stats succinctly; avoid heavy result UIs in v1
- Read backend URL from VITE_API_URL env
```

### **10. BACKEND SESSION CONTEXT (Flask)**

**What it means:** *Keep the server small, explicit, and safe.*

```
BACKEND_SCRAPER_SESSION_CONTEXT:
- Endpoints: GET /health, POST /api/cma
- Single threading.Lock to serialize runs
- stdin to lamudi_scraper.py; read backend/data/output.csv
- Map PSGC via small dictionary module (whitelist only)
- Pandas for stats; return JSON; sanitize errors
```

### **11. DEPLOYMENT/OPS GUARDRAILS**

**What it means:** *One blueprint, clear envs, and uptime ping.*

```
SCRAPER_DEPLOYMENT_CONTEXT:
- Single render.yaml: web (Flask) + static (Vite build)
- VITE_API_URL set to backend public URL
- UptimeRobot hits /health every 5 minutes
- Expect throttling on free tier; upgrade if demos require reliability
```

### **12. OBSERVABILITY (LEAN)**

**What it means:** *Minimal logs that help you debug, not drown you.*

```
SCRAPER_OBSERVABILITY_CONTEXT:
- Log: start/end of scrape, province/type/count, duration, exit code
- No logging of user-entered text or raw CSV
- Aggregate error types for quick diagnosis
```

### **13. LEGAL/COMPLIANCE POSTURE**

**What it means:** *Use v1 to validate demand; plan for legitimacy.*

```
SCRAPER_LEGAL_CONTEXT:
- v1 scraper is evaluation only; disclose in README and sales calls
- Prepare path to official Lamudi API/licensing upon buyer interest
- Avoid high-frequency scraping; respect site stability
```

### **14. SWAP STRATEGY (TO OFFICIAL API)**

**What it means:** *Make the migration a swap, not a rebuild.*

```
SCRAPER_SWAP_CONTEXT:
- Keep /api/cma request/response stable
- Encapsulate 'data acquisition' behind a small function boundary
- Replace subprocess+CSV with API client later without UI changes
```

### **15. CONCURRENCY POLICY**

**What it means:** *Prevent collisions with the simplest mechanism.*

```
SCRAPER_CONCURRENCY_CONTEXT:
- Single-flight: only one scrape at a time via lock
- Return 409 'busy' immediately to callers
- No queuing, no overlapping, no per-request files in v1
```

### **16. UX/COMMS POLICY**

**What it means:** *Set expectations clearly during long operations.*

```
SCRAPER_UX_CONTEXT:
- Always show progress message and disable actions during scrape
- Clear, human-readable errors; suggest retry if busy
- Communicate expected duration (5–10 minutes) upfront
```

---

## **SINGLE-SERVER IMPLEMENTATION GUARDRAILS**

### **1. INTEGRATION CONSTRAINT LAYER**

**What it means:** *Forces Cursor to understand the single-server architecture and avoid platform fragmentation.*

```
SINGLE_SERVER_INTEGRATION_CONTEXT:
"Kairos single-server implementation constraints:
- Flask backend serves BOTH API endpoints AND static React files
- NO separate frontend deployment service (eliminates two-service complexity)
- React build output goes directly into backend/static/ directory
- All API calls use relative URLs (/api/cma) - no CORS needed
- Single render.yaml deploys everything as one web service
- Flask static serving handles React Router with catch-all route
- Direct implementation: Build frontend into backend, serve from Flask"
```

### **2. TECHNOLOGY STACK VERIFICATION CONTEXT**

**What it means:** *Prevents assumption errors about tech stack - ensures Cursor knows it's Python/Flask, not Node.js.*

```
TECH_STACK_REALITY_CONTEXT:
"Kairos backend technology stack (verified):
- Backend: Python Flask (NOT Node.js Express)
- Scraper: Python BeautifulSoup (NOT JavaScript Puppeteer)
- Dependencies: pip requirements.txt (NOT npm package.json)
- Runtime: Python 3.x (NOT Node.js)
- Deployment: gunicorn (NOT pm2 or nodemon)
- API calls: Flask routes (NOT Express routes)
- Static serving: Flask send_from_directory (NOT Express.static)

CRITICAL: Always verify Python/Flask before suggesting Node.js solutions"
```

### **3. DATA FLOW VALIDATION CONTEXT**

**What it means:** *Ensures PSGC codes and data formats align between frontend and backend without debugging delays.*

```
DATA_FORMAT_ALIGNMENT_CONTEXT:
"PSGC code validation requirements:
- Frontend sends: psgc_province_code (string, 4 digits for Metro Manila)
- Backend expects: psgc_province_code (string, validates with psgc_mapper.py)
- Metro Manila addresses MUST use '1376' (not city-level codes like 1375, 1374)
- Property type MUST be 'condo' (lowercase, exact match)
- Count MUST be integer between 1 and MAX_COUNT (default 100)
- Test data flow: Frontend → Flask validation → psgc_mapper → scraper
- NO debugging PSGC mismatches - verify format alignment first"
```

### **4. ENVIRONMENT CONFIGURATION CONTEXT**

**What it means:** *Prevents environment variable and URL configuration mistakes that cause connection failures.*

```
ENVIRONMENT_SETUP_CONTEXT:
"Single-server environment configuration:
- Remove VITE_API_URL environment variable (not needed for relative URLs)
- Frontend API calls: fetch('/api/cma') NOT fetch('${VITE_API_URL}/api/cma')
- Flask serves on port 3000 in development, Render port in production
- No CORS configuration needed (same origin for all requests)
- Build process: npm run build → copy to backend/static/
- Development: Flask on 3000, React dev server NOT needed for API testing
- Production: Single Flask service serves everything"
```

### **5. DEPLOYMENT SIMPLIFICATION CONTEXT**

**What it means:** *Forces single-platform deployment to avoid the complexity of managing multiple services.*

```
SINGLE_PLATFORM_DEPLOYMENT_CONTEXT:
"Render deployment must be single service only:
- ONE render.yaml web service (eliminate static site service)
- Build command: Build React → Copy to backend/static → Install Python deps
- Start command: gunicorn backend.app:app
- NO separate frontend deployment
- NO environment variables for API URLs
- NO CORS configuration needed
- Single dashboard, single deployment, single URL
- UptimeRobot pings /health endpoint to prevent spin-down"
```

### **6. CURSOR ARCHITECTURAL GUARDRAILS**

#### **MINIMAL TECHNICAL DEBT GUARDRAIL**

**What it means:** *Prevents over-engineering the Flask static serving implementation.*

```
ROLE: Single-Server Flask Integration Architect
CONSTRAINT: Minimal Flask modifications - add static serving only
REQUIREMENT: Use Flask's built-in static serving, no complex middleware
PATTERN: send_from_directory for React app, existing API routes unchanged
ANTI-PATTERN: Do NOT create custom static file handlers or complex routing

IMPLEMENTATION_PATTERN:
```python
# Add ONLY these lines to existing Flask app:
from flask import send_from_directory
app = Flask(__name__, static_folder='static', static_url_path='')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    return send_from_directory(app.static_folder, 'index.html')
```
```

#### **NO MAJOR FUCKUPS GUARDRAIL**

**What it means:** *Ensures React Router works correctly with Flask's catch-all route.*

```
REACT_ROUTER_SAFETY_CONTEXT:
"Flask static serving MUST handle React Router correctly:
- Catch-all route serves index.html for all non-API paths
- API routes (/api/*) take precedence over catch-all
- Static assets (JS, CSS, images) served from /static/ directory
- React Router handles client-side routing after index.html loads
- 404 errors for non-existent static files return proper HTTP status
- NO serving index.html for API routes or static assets"

ROUTE_PRIORITY:
1. /health (API route)
2. /api/cma (API route)  
3. /static/* (static files)
4. /* (catch-all → index.html)
```

#### **SECURITY GUARDRAIL**

**What it means:** *Removes CORS complexity while maintaining security for single-server setup.*

```
SINGLE_SERVER_SECURITY_CONTEXT:
"Single-server security requirements:
- Remove CORS configuration (same origin eliminates need)
- Keep existing input validation and sanitization
- Maintain rate limiting and scraping locks
- Static files served with proper MIME types
- No sensitive data in static files
- API endpoints remain protected with existing validation
- Error responses don't expose file system paths"
```

#### **BUILD PROCESS GUARDRAIL**

**What it means:** *Ensures the build and copy process works reliably in Render's environment.*

```
BUILD_PROCESS_RELIABILITY_CONTEXT:
"Single-server build process requirements:
- Build React app in Kairos/ directory first
- Copy ALL build files to backend/static/ (including assets)
- Preserve directory structure (assets/, index.html, etc.)
- Handle build failures gracefully with clear error messages
- Verify static files exist before starting Flask server
- Use absolute paths in build commands for reliability

BUILD_COMMAND_STRUCTURE:
```bash
cd Kairos && npm install && npm run build
cp -r build/* ../backend/static/
cd ../backend && pip install -r requirements.txt
```"
```

### **7. SPECIALIZED CURSOR SESSION PROMPTS**

#### **FLASK STATIC SERVING PROMPT**

**What it means:** *Instructions for modifying Flask app to serve React static files.*

```
FLASK_SESSION_CONTEXT: Adding static file serving to existing Flask app

ROLE: Python Flask Developer specializing in single-server architecture
TASK: Modify existing Flask app to serve React static files
CONSTRAINT: Minimal changes to existing API functionality

REQUIREMENTS:
1. Add static_folder configuration to existing Flask app
2. Create catch-all route for React Router compatibility
3. Preserve all existing API routes (/health, /api/cma)
4. Handle static assets (JS, CSS, images) correctly
5. Maintain existing error handling and logging

IMPLEMENTATION_REQUIREMENTS:
- Use Flask's send_from_directory (no custom handlers)
- Catch-all route serves index.html for non-API paths
- Static files served from /static/ URL path
- No changes to existing API route logic
- Preserve all existing Flask configuration

FILES_TO_MODIFY:
- backend/app.py (add static serving only)
- NO changes to existing API endpoints
- NO changes to scraper integration
- NO changes to CORS configuration (remove it)

Please modify the Flask app to serve React static files with minimal changes.
```

#### **FRONTEND API INTEGRATION PROMPT**

**What it means:** *Instructions for updating React app to use relative API URLs.*

```
FRONTEND_SESSION_CONTEXT: Updating React app for single-server deployment

ROLE: React Frontend Developer specializing in API integration
TASK: Update API calls to use relative URLs for single-server setup
CONSTRAINT: Remove environment variable dependencies

REQUIREMENTS:
1. Change API calls from absolute to relative URLs
2. Remove VITE_API_URL environment variable usage
3. Update all fetch calls to use /api/* paths
4. Test API integration with local Flask server
5. Ensure error handling works with relative URLs

API_CALL_CHANGES:
- FROM: fetch(`${import.meta.env.VITE_API_URL}/api/cma`)
- TO: fetch('/api/cma')
- Remove: VITE_API_URL from .env file
- Remove: CORS configuration (not needed)

FILES_TO_MODIFY:
- Kairos/src/App.tsx (API call updates)
- Kairos/.env (remove VITE_API_URL)
- Test with: cd backend && python app.py

Please update the React app for single-server API integration.
```

#### **DEPLOYMENT CONFIGURATION PROMPT**

**What it means:** *Instructions for creating single-service render.yaml configuration.*

```
DEPLOYMENT_SESSION_CONTEXT: Creating single-service Render deployment

ROLE: DevOps Engineer specializing in single-server deployments
TASK: Create render.yaml for single Flask service with React frontend
CONSTRAINT: Eliminate separate frontend service deployment

REQUIREMENTS:
1. Single web service in render.yaml (remove static service)
2. Build command that builds React and copies to backend
3. Start command that runs Flask with gunicorn
4. Environment variables for Python runtime only
5. Proper build order (React first, then copy, then Python deps)

RENDER_YAML_STRUCTURE:
```yaml
services:
  - type: web
    name: kairos-app
    env: python
    buildCommand: |
      cd Kairos && npm install && npm run build
      cp -r build/* ../backend/static/
      cd ../backend && pip install -r requirements.txt
    startCommand: cd backend && gunicorn app:app
```

DEPLOYMENT_REQUIREMENTS:
- Single service type: web (not static)
- Environment: python (not node)
- Build React app before copying to backend
- Install Python dependencies after copying files
- Start Flask server with gunicorn

Please create the single-service render.yaml configuration.
```

### **8. PHASE-BY-PHASE VALIDATION GUARDRAILS**

#### **PHASE 1 VALIDATION**

```
PHASE_1_SUCCESS_CRITERIA:
- Flask API responds to curl localhost:3000/health
- CMA endpoint accepts valid PSGC codes (1376 for Metro Manila)
- Scraper integration returns property data
- No port conflicts between Flask and React dev server
- Environment variables configured correctly

FAIL_FAST_IF:
- Flask app doesn't start on port 3000
- API returns 400 errors for valid PSGC codes
- Scraper fails to return data
- Multiple services trying to use same port
```

#### **PHASE 2 VALIDATION**

```
PHASE_2_SUCCESS_CRITERIA:
- Flask serves index.html on root route
- Static assets (JS, CSS) load correctly
- API routes still work (/health, /api/cma)
- React Router navigation works
- No 404 errors for static files

FAIL_FAST_IF:
- Flask can't find static files
- API routes return index.html instead of JSON
- React app shows blank page
- Static assets return 404 errors
```

#### **PHASE 3 VALIDATION**

```
PHASE_3_SUCCESS_CRITERIA:
- Frontend API calls use relative URLs
- No CORS errors in browser console
- CMA generation works end-to-end
- Environment variables removed
- API calls succeed from React app

FAIL_FAST_IF:
- Browser shows CORS errors
- API calls still use absolute URLs
- CMA generation fails
- Environment variables still referenced
```

#### **PHASE 4 VALIDATION**

```
PHASE_4_SUCCESS_CRITERIA:
- Single render.yaml deploys successfully
- React app loads from Flask server
- API endpoints work in production
- No separate frontend deployment
- UptimeRobot keeps service awake

FAIL_FAST_IF:
- Build process fails in Render
- Static files not found in production
- API calls fail in production
- Multiple services deployed
- Service spins down due to inactivity
```

### **9. EMERGENCY ROLLBACK PROCEDURES**

**What it means:** *Quick recovery if single-server implementation fails.*

```
ROLLBACK_PROCEDURES:
"If single-server implementation fails:

IMMEDIATE_ROLLBACK:
1. Revert render.yaml to two-service configuration
2. Restore VITE_API_URL environment variable
3. Deploy frontend as separate static service
4. Keep backend as separate web service
5. Test two-service setup works

RECOVERY_CHECKLIST:
- [ ] Two services deploy successfully
- [ ] Frontend loads from static service
- [ ] Backend API responds correctly
- [ ] CORS configuration working
- [ ] CMA generation functional

LESSON_LEARNED:
Document what failed in single-server attempt
Plan smaller incremental changes
Test locally before deployment"
```

---

## **COMMON MISTAKES PREVENTION**

### **Architecture Assumption Errors**
- **Mistake**: Assuming Node.js backend when you actually have Python/Flask
- **Impact**: Wasted time on wrong implementation approach
- **Prevention**: Always verify tech stack before suggesting solutions
- **Guardrail**: TECH_STACK_REALITY_CONTEXT

### **Over-Engineering Before Validation**
- **Mistake**: Building complex AI systems before validating basic functionality
- **Impact**: 3-4 months of development vs 3 weeks for MVP
- **Prevention**: Build minimal version first, validate with users
- **Guardrail**: SCRAPER_MINIMALISM_GUARDRAIL

### **Platform Fragmentation**
- **Mistake**: Maintaining multiple deployment platforms unnecessarily
- **Impact**: Complex management, multiple configs, deployment confusion
- **Prevention**: Use single platform when possible
- **Guardrail**: SINGLE_PLATFORM_DEPLOYMENT_CONTEXT

### **Environment Configuration Issues**
- **Mistake**: Wrong API URLs, port conflicts, missing environment variables
- **Impact**: Development delays, debugging confusion
- **Prevention**: Test connectivity first, verify environment setup
- **Guardrail**: ENVIRONMENT_SETUP_CONTEXT

### **Data Format Misalignment**
- **Mistake**: Frontend sending wrong PSGC codes that backend couldn't handle
- **Impact**: 400 errors, debugging confusion
- **Prevention**: Validate data structure alignment between services
- **Guardrail**: DATA_FORMAT_ALIGNMENT_CONTEXT

### **Client-Side Database Attempts**
- **Mistake**: Trying to use SQLite in browser for address autocomplete
- **Impact**: Technical impossibility, 50MB+ bundle sizes
- **Prevention**: Always verify library compatibility with target environment
- **Guardrail**: PH_ADDRESS_BACKEND_INTEGRATION_CONTEXT

---

## **CRITICAL CURSOR RULES**

### **PH-ADDRESS API INTEGRATION RULES**
```
# PH-ADDRESS API INTEGRATION RULES
- ph-address runs on backend only - never attempt client-side SQLite
- Frontend uses API calls for address autocomplete - no direct library access
- AddressInput component must handle network latency and errors gracefully
- Backend API requires rate limiting and security controls
- Cache address searches in localStorage to reduce API calls
- Always validate API responses before using in CMA generation
- NO MOCK DATA - implement real API integration from start
```

### **SCRAPER INTEGRATION RULES**
```
# SCRAPER INTEGRATION RULES
- Scraper runs server-side only - no client-side scraping logic
- Use structured PSGC input only - no raw text from users
- Single-flight policy - only one scrape at a time via lock
- Return 409 'busy' immediately if scraper running
- Compute stats server-side - return compact JSON only
- Clean up partial results - never return inconsistent stats
- Use process timeout and proper error handling
- NO job queues or background workers in v1
```

### **SINGLE-SERVER IMPLEMENTATION RULES**
```
# SINGLE-SERVER IMPLEMENTATION RULES
- Flask serves both API and static files - no separate frontend deployment
- API calls use relative URLs (/api/cma) - remove VITE_API_URL environment variable
- React build output goes to backend/static/ - not separate deployment
- PSGC codes must be province-level (1376) not city-level (1375, 1374, 1378)
- Test Flask API locally before modifying for static serving
- Single render.yaml web service - eliminate static site service
- Remove CORS configuration - same origin eliminates need
- Verify Python/Flask tech stack - never assume Node.js
- Build React first, then copy to backend, then install Python deps
- Catch-all route serves index.html for React Router compatibility
- NO over-engineering - minimal Flask modifications only
- Test each phase before proceeding to next phase
```

### **GENERAL DEVELOPMENT RULES**
```
# GENERAL DEVELOPMENT RULES
- Always verify tech stack assumptions before planning architecture
- Start with simplest possible version - validate with real users fast
- Use free tools when possible - keep costs minimal for MVP
- Keep codebase lean - question complexity at every step
- Trust instincts over complex solutions
- One platform when possible - avoid unnecessary fragmentation
- Build foundation first, optimization layer last
- Document architectural decisions and lessons learned
- Test connectivity and environment setup before debugging complex issues
- Use structured data formats - prevent injection attacks
- Implement proper error handling - fail fast and fail clear
- Cache common operations - improve performance without complexity
```

### **INLINE TOGGLE & DROPDOWN DESIGN RULES**
```
# INLINE TOGGLE & COMPARISONS DROPDOWN DESIGN RULES
- NEVER modify InlineToggle styling without explicit permission
- InlineToggle MUST remain transparent (no bg, border, or shadow)
- Comparisons dropdown MUST use rounded-3xl corners (not lg or xl)
- Dropdown panel MUST use bg-white/95 and shadow-lg
- Color palette is LOCKED (#E5E4E6, #F3F3F2, #3B3832, #7A7873)
- Before ANY dropdown changes: run visual verification checklist
- If unsure about a design change: STOP and ASK first
- NEVER create CustomSelect or other new dropdown components
- NEVER add dropdown libraries (react-select, headlessui)
- NEVER make wholesale replacements - surgical changes only
- Design drift prevention: reference inline checkpoint comments
- See INLINE TOGGLE & COMPARISONS DROPDOWN DESIGN GUARDRAILS section
```

---

## **QUICK REFERENCE COMMANDS**

### **Development Testing**
```bash
# Test Flask API locally
cd backend && python app.py
curl localhost:3000/health
curl -X POST localhost:3000/api/cma -d '{"psgc_province_code":"1376","property_type":"condo","count":5}'

# Test React app
cd Kairos && npm run dev
npm run build

# TypeScript and linting checks
npx tsc --noEmit
npm run lint
```

### **Single-Server Build Process**
```bash
# Build and copy process
cd Kairos && npm install && npm run build
cp -r build/* ../backend/static/
cd ../backend && pip install -r requirements.txt

# Test single-server setup
cd backend && python app.py
# Visit http://localhost:3000
```

### **Git Operations**
```bash
# Create checkpoint before major changes
git tag -a checkpoint-name -m "Description"

# View specific commit
git show <commit-hash>

# Restore from checkpoint
git checkout -b restore-branch checkpoint-name
```

---

## **SUCCESS CRITERIA CHECKLIST**

### **Address Autocomplete Implementation**
- [ ] User can type address and get suggestions
- [ ] Suggestions use real PSGC codes (not placeholder data)
- [ ] Selected address creates proper `KairosAddressOutput` structure
- [ ] CMA scraper receives PSGC codes for targeting
- [ ] Zero TypeScript errors
- [ ] Zero linter errors
- [ ] Kairos design system styling throughout
- [ ] API swap requires only 3 lines of code
- [ ] Production-ready with security and performance

### **Scraper Integration Implementation**
- [ ] Frontend-backend communication working
- [ ] API calls returning 200 responses
- [ ] Loading states and error handling implemented
- [ ] End-to-end smoke test successful
- [ ] Scraper integration returns property data
- [ ] Stats computation working (avg, median, min, max)
- [ ] Single-flight policy enforced
- [ ] Proper error messages for all failure cases

### **Single-Server Implementation**
- [ ] Flask serves React app on root route
- [ ] API endpoints work from same server
- [ ] React Router navigation works
- [ ] Static assets load correctly
- [ ] No CORS errors
- [ ] Single render.yaml deploys successfully
- [ ] UptimeRobot keeps service awake
- [ ] CMA generation works end-to-end

---

**Last Updated:** December 2024  
**Status:** ✅ Complete reference for all Kairos development phases  
**Maintainer:** Kairos Development Team

**Related Documents:**
- `BACKEND-FRONTEND-INTEGRATION.md` - Integration implementation details
- `PIVOTS-MADE.md` - Architectural decisions and lessons learned
- `PSGC-DATA-SEARCHING-REFERENCE.md` - Address search implementation details
- `render.yaml` - Deployment configuration

---

## Backend scraping and adapter guardrails

### Scope guardrails
- Keep a single minimal adapter per source in `backend/src/adapters/<site>_adapter.py`.
- No new packages, headless browsers, proxies, queues, schedulers, or routes.
- Do not change the `/api/cma` request/response contract or UI.

### Data contract guardrails
- Canonical fields: source, property_id, address, price, bedrooms, bathrooms, sqm, property_type, coordinates, url, raw_data.
- `price` is a float strictly derived from the site’s primary price; no extra price fields.
- Limit response `properties` to max 100; stats computed from full price series.

### Scraper behavior guardrails
- HTTP: `requests.Session` with headers, `timeout<=15s`, jitter 0.3–0.8s on details.
- Selectors: exactly two strategies per surface:
  - List pages: current class-based primary, then one attribute/URL-based fallback.
  - Detail pages: current class-based primary, then one attribute-based fallback per field (price, sqm, beds, baths).
- Pagination: default to 1 if unknown; scan hrefs for `?page=` as fallback.
- Mini‑crawl: same host only, breadth across pages 1..`min(max_page, MAX_PAGES)`, no depth > 1, stop as soon as `count` links collected.

### Limits and performance guardrails
- End‑to‑end request budget ≤ existing API timeout (default 600s).
- Default `count` ≤ 100; hard cap at `SCRAPER_MAX_COUNT`.
- Page guardrail: `SCRAPER_MAX_PAGES` default 5 (optionally 50), never exceed.
- No heavy parsing (no JSON‑LD), no headless browser.

### Reliability guardrails
- If page 1 yields zero cards, short‑circuit with `meta.reason = selector_miss` or `blocked`.
- Retries: ≤2 per page with backoff ≤2s (only if implemented); otherwise none.
- Never recurse links beyond discovered pagination.

### Logging/observability guardrails
- Log only: province, property_type, count, duration_ms, properties_len, stats.count, optional pages_scanned, and reason on empty.
- No HTML content, no addresses, no PII. Levels: info (success), warn (empty), error (exceptions).

### Security guardrails
- Sanitize inputs (PSGC, property_type, count) in API.
- Outbound requests restricted to the source domain; no dynamic domains.
- HTTPS assumed; safe error messages only.

### Code quality guardrails
- Single small adapter module per site (<200 lines).
- Pure functions where possible; clear type hints; no globals; no TODOs.
- Keep scraper edits surgical and localized.

### Testing guardrails
- One minimal unit test per adapter mapping using tiny synthetic DataFrame.
- Manual curl test for `/api/cma` on at least one supported province.
- Optional: smoke script to assert non‑empty price_series for happy path.

### Rollout guardrails
- Continue writing `backend/data/output.csv` for diagnostics; API prefers in‑memory normalized results.
- No frontend changes required; dev may point to `http://localhost:3000/api/cma`.

### Failure messaging guardrails
- On failure/empty: existing empty payload; include non‑breaking `meta.reason` in `{selector_miss, blocked, empty_market}`.
- Never surface raw scraper errors to the client.

### Out‑of‑scope (future work)
- No headless browser, proxy rotation, caching layer, job queue, or metrics dashboard.
- JSON‑LD parsing, richer UI messaging, multi‑source aggregation are follow‑ups.

---

## **SCRAPER SELECTOR FIX GUARDRAILS**

### **🎯 PURPOSE & STRATEGY**
- **Purpose:** Surgical selector updates to fix price extraction while keeping codebase lean
- **Timeline:** 1-2 hours maximum
- **Strategy:** Temporary fix until official API migration (post-first sale)

---

### **📋 SCOPE GUARDRAILS**

#### **✅ DO:**
- Update selector strings ONLY (class names, attributes)
- Test with 5-10 properties maximum
- Keep existing fallback logic structure
- Document which selectors were changed (inline comments)
- Fix price, location, and other broken fields in ONE session

#### **❌ DON'T:**
- Add new dependencies (no Selenium, no external services)
- Rewrite scraper architecture
- Add complex error handling/monitoring
- Create new files or modules
- Add health checks, alerts, or observability (YAGNI for now)
- Fix selectors "perfectly" - good enough is enough

---

### **🔧 IMPLEMENTATION GUARDRAILS**

#### **Discovery Phase (30 min max):**
- Pick ONE property URL from existing `output.csv`
- Use simple Python script OR browser DevTools (whichever is faster)
- Find selectors for: price, location, bedrooms, baths, floor_area
- Stop searching once you find working selectors (don't optimize)

#### **Update Phase (15-30 min max):**
- Only modify `backend/src/scraper/scraper.py`
- Lines to change: 248-252 (primary selectors), 285-303 (fallback selectors)
- Keep existing `find_all()` / `select()` patterns
- Update strings only, don't restructure logic
- Add 1-line comment: `# Updated 2025-10-01: Lamudi redesign`

#### **Test Phase (15 min max):**
- Run: `python backend/lamudi_scraper.py` with count=5
- Check: `backend/data/output.csv` has non-zero TCP values
- Quick API test: `curl POST /api/cma`
- If stats appear → Done. If not → debug ONE field at a time

---

### **📊 QUALITY GUARDRAILS**

#### **Success Criteria:**
- [ ] `output.csv` shows prices > 0 for most properties
- [ ] API response has `stats.avg > 0` and `stats.median > 0`
- [ ] At least 60% of scraped properties have valid prices (not 100%)
- [ ] No new linter errors introduced
- [ ] No changes to adapter, API, or frontend

#### **Good Enough Threshold:**
- 60% price extraction success = Ship it
- 80% success = Great, don't optimize further
- <50% success = Try different selectors, don't add complexity

---

### **🚫 ANTI-PATTERNS TO AVOID**

#### **❌ Over-Engineering:**
- "Let me add retry logic for failed requests"
- "Let me build a selector health monitoring system"
- "Let me make the fallbacks more sophisticated"
- "Let me add unit tests for each selector"
→ **NO.** Update strings, test, ship.

#### **❌ Perfectionism:**
- "I need 100% extraction success rate"
- "Let me handle all edge cases"
- "Let me add validation for every field"
→ **NO.** 60-80% success is fine for validation phase.

#### **❌ Scope Creep:**
- "While I'm here, let me refactor the scraper"
- "Let me add better logging"
- "Let me extract more fields"
→ **NO.** Fix what's broken, nothing more.

---

### **⏰ TIME BOXING**

#### **Hard Limits:**
- Discovery: 30 minutes → If not found, try browser DevTools instead
- Updates: 30 minutes → If more needed, selectors are too complex, pick simpler ones
- Testing: 15 minutes → If not working, revert and reassess
- **Total: 2 hours MAX** → If exceeds, stop and evaluate alternatives

#### **If You Hit 2 Hours:**
- Stop and ask: "Is this the right approach?"
- Consider: Mock data demo + API partnership pursuit instead
- Don't fall into sunk cost fallacy

---

### **🛠️ MAINTENANCE EXPECTATIONS**

#### **Accept These Realities:**
- This WILL break again (3-12 months)
- Next fix will also take 1-2 hours
- This is temporary until official API
- Not investing in "perfect" scraper

#### **When It Breaks Next Time:**
- Repeat this same process (1-2 hours)
- OR trigger API partnership discussions
- OR switch to mock data demos
- Decision depends on business context at that time

---

### **🎯 CURSOR SESSION PROMPT**

```
ROLE: Python web scraping developer fixing outdated selectors
TASK: Update Lamudi scraper selectors for price/location extraction
CONSTRAINT: Surgical fix only - no architectural changes

FILES TO MODIFY:
- backend/src/scraper/scraper.py (lines 248-303 only)

REQUIREMENTS:
1. Find current Lamudi HTML selectors for price, location, beds, baths, sqm
2. Update selector strings (class names, attributes)
3. Keep existing fallback logic structure unchanged
4. Test with 5 properties to verify
5. Stop at "good enough" (60%+ success)

TIME LIMIT: 2 hours maximum
SUCCESS: stats.avg > 0 in API response

DO NOT:
- Add new dependencies
- Rewrite scraper logic
- Add monitoring/alerts
- Create new files
- Optimize beyond working state

Please help me fix the selectors with minimal changes.
```

---

### **📋 VALIDATION CHECKLIST**

#### **Before Starting:**
- [ ] Read these guardrails completely
- [ ] Set 2-hour timer
- [ ] Have `output.csv` URLs ready
- [ ] Decide: Script inspection OR browser DevTools

#### **During Implementation:**
- [ ] Only modifying scraper.py
- [ ] Not adding new functions/files
- [ ] Not refactoring existing code
- [ ] Changes are string updates only

#### **Before Completing:**
- [ ] Tested with 5 properties
- [ ] TCP values > 0 in CSV
- [ ] Stats appear in API response
- [ ] No linter errors added
- [ ] Took < 2 hours total

---

### **🔄 ROLLBACK PLAN**

#### **If Fix Fails:**
- `git checkout backend/src/scraper/scraper.py` (instant revert)
- Reassess: Is scraping the right approach?
- Consider: Mock data demos + API partnerships

#### **Don't:**
- Spend another 2 hours "perfecting" it
- Add Selenium or complex solutions
- Keep trying indefinitely

---

### **🎯 ONE-SENTENCE SUMMARY**

**"Update selector strings in scraper.py lines 248-303, test with 5 properties, ship at 60%+ success rate, done in 2 hours max—this is temporary until API migration so don't over-engineer it."**

---

## **DASHBOARD IMPLEMENTATION GUARDRAILS**

### **🎯 CORE PHILOSOPHY**
**"Build the visual foundation of a comprehensive dashboard using only the data you currently have, with professional-looking placeholders for future expansion, in the most minimal way possible that integrates seamlessly with your existing codebase."**

---

### **🛡️ DASHBOARD IMPLEMENTATION GUARDRAILS**

#### **1. SINGLE FILE CHANGE GUARDRAIL**
```
CONSTRAINT: Only modify App.tsx lines 348-389
REQUIREMENT: Zero new files, zero new imports, zero new dependencies
ANTI-PATTERN: Do NOT create new components or separate files
RATIONALE: Follows "minimal technical debt" principle
```

#### **2. INLINE STRUCTURE GUARDRAIL**
```
CONSTRAINT: Build dashboard layout inline using JSX
REQUIREMENT: Use existing React patterns and styling approaches
ANTI-PATTERN: Do NOT create separate dashboard components
RATIONALE: Maintains simplicity and reduces maintenance burden
```

#### **3. EXISTING DESIGN SYSTEM GUARDRAIL**
```
CONSTRAINT: Use only current Kairos design system classes
REQUIREMENT: bg-kairos-*, text-kairos-*, border-kairos-* classes only
ANTI-PATTERN: Do NOT create new CSS classes or modify globals.css
RATIONALE: Maintains consistency and follows established patterns
```

#### **4. DATA REALITY GUARDRAIL**
```
CONSTRAINT: Only populate sections with current 4 metrics
REQUIREMENT: count, avg, median, min-max from cma.stats object
ANTI-PATTERN: Do NOT create fake data or complex calculations
RATIONALE: "Data reality over data fantasy" - use what exists
```

#### **5. PLACEHOLDER PROFESSIONALISM GUARDRAIL**
```
CONSTRAINT: Empty sections must look professional and intentional
REQUIREMENT: "Coming Soon" or "Data not available" messaging
ANTI-PATTERN: Do NOT leave sections completely blank or broken
RATIONALE: Maintains visual impact while being honest about data limitations
```

#### **6. ZERO BREAKING CHANGES GUARDRAIL**
```
CONSTRAINT: Maintain all existing functionality exactly as-is
REQUIREMENT: CMA generation, error handling, loading states unchanged
ANTI-PATTERN: Do NOT modify API calls, state management, or data flow
RATIONALE: "No major fuckups" - don't break what's working
```

#### **7. VISUAL FOUNDATION GUARDRAIL**
```
CONSTRAINT: Build structure ready for future data expansion
REQUIREMENT: Dashboard layout accommodates additional sections easily
ANTI-PATTERN: Do NOT build rigid structure that's hard to extend
RATIONALE: "Foundation first" - build the visual foundation now
```

#### **8. TIME BOXING GUARDRAIL**
```
CONSTRAINT: Complete implementation in 40 minutes maximum
REQUIREMENT: Set timer, stop when time expires regardless of completeness
ANTI-PATTERN: Do NOT spend hours perfecting minor details
RATIONALE: "Fast feedback over perfect planning" - ship and iterate
```

#### **9. GOOD ENOUGH GUARDRAIL**
```
CONSTRAINT: Stop when it looks professional, not when it's perfect
REQUIREMENT: Professional appearance with current data populated
ANTI-PATTERN: Do NOT optimize beyond "good enough" threshold
RATIONALE: "Working beats elegant" - functional over perfect
```

#### **10. INTEGRATION GUARDRAIL**
```
CONSTRAINT: Seamless integration with existing codebase patterns
REQUIREMENT: Follows existing component structure, naming, and styling
ANTI-PATTERN: Do NOT introduce new patterns or conventions
RATIONALE: Maintains consistency and reduces learning curve
```

---

### **🚫 DASHBOARD ANTI-PATTERNS TO AVOID**

#### **❌ Over-Engineering:**
- "Let me create a DashboardContainer component"
- "Let me add TypeScript interfaces for dashboard data"
- "Let me build a grid system library"
- "Let me add animation libraries"

#### **❌ Perfectionism:**
- "I need perfect responsive design"
- "Let me handle all edge cases"
- "I need 100% pixel-perfect alignment"
- "Let me add complex hover effects"

#### **❌ Scope Creep:**
- "While I'm here, let me refactor the entire results section"
- "Let me add new data visualization features"
- "Let me improve the overall app architecture"
- "Let me add accessibility features"

---

### **✅ DASHBOARD SUCCESS CRITERIA**

#### **Functional Requirements:**
- [ ] Dashboard layout displays correctly
- [ ] Current 4 metrics populate correctly
- [ ] Placeholder sections look professional
- [ ] Responsive design works on mobile/desktop
- [ ] All existing functionality preserved

#### **Technical Requirements:**
- [ ] Single file modification (App.tsx)
- [ ] Zero new dependencies
- [ ] Zero new components
- [ ] Uses existing Kairos design system
- [ ] No breaking changes to existing code

#### **Timeline Requirements:**
- [ ] Completed in ≤40 minutes
- [ ] Ready for immediate testing
- [ ] Ready for user feedback

---

### **🎯 DASHBOARD IMPLEMENTATION STRATEGY**

**Single File Change:** Only modify `App.tsx` lines 348-389

**Zero New Components:** Build everything inline using existing patterns

**Zero New Files:** No additional imports or dependencies

**Existing Design System:** Use all current Kairos classes and styling

---

## **NEIGHBORHOOD EXTRACTION GUARDRAILS**

### **📋 SCOPE GUARDRAILS**
- Keep neighborhood extraction as a **single utility function** in existing `backend/src/utils/last_word.py`
- **No new packages, dependencies, or external libraries** for neighborhood processing
- **Do not change** the `/api/cma` request contract; only extend response with `neighborhoods` field
- **No frontend changes required** for neighborhood data display
- **Single small addition** per file; keep edits surgical and localized

### **📊 DATA CONTRACT GUARDRAILS**
- **Canonical neighborhood field**: `neighborhood` as string in normalized property data
- **Neighborhood data format**: Extract only the part before first comma in address
- **Fallback handling**: Empty string `''` when no comma found in address
- **Response limit**: Neighborhood analysis included only when properties exist
- **Non-breaking addition**: Existing API contract remains unchanged

### **🔧 ADDRESS PARSING BEHAVIOR GUARDRAILS**
- **Parsing strategy**: Single regex-based extraction using `address.split(',')[0].strip()`
- **Fallback logic**: Return empty string if address is None, empty, or contains no comma
- **Error handling**: Graceful degradation - never crash on malformed addresses
- **Performance**: O(1) string operation; no heavy parsing or external lookups
- **Consistency**: Same parsing logic applied to all addresses in dataset

### **📈 DATA QUALITY GUARDRAILS**
- **Neighborhood normalization**: Basic mapping for common variations (BGC → Fort Bonifacio)
- **Sample size validation**: Only include neighborhoods with ≥2 properties in analysis
- **Price validation**: Exclude properties with price = 0 from neighborhood averages
- **Address validation**: Skip properties with empty or malformed addresses
- **Duplicate handling**: Count unique properties per neighborhood (no double-counting)

### **⚡ PERFORMANCE GUARDRAILS**
- **Computation limit**: Neighborhood analysis must complete within existing API timeout
- **Memory efficiency**: Process neighborhoods in single pass through properties array
- **Response size**: Limit neighborhood analysis to top 20 neighborhoods by property count
- **Caching**: No caching in v1; keep implementation simple
- **Processing time**: Neighborhood extraction should add <50ms to total API response time

### **🛡️ RELIABILITY GUARDRAILS**
- **Graceful degradation**: If neighborhood extraction fails, continue with existing response
- **Empty neighborhood handling**: Return empty `neighborhoods: {}` when no valid neighborhoods found
- **Address format changes**: Robust parsing that handles various comma-separated formats
- **Error isolation**: Neighborhood extraction errors don't affect property data or stats
- **Fallback response**: Always return valid JSON even if neighborhood analysis fails

### **📝 LOGGING/OBSERVABILITY GUARDRAILS**
- **Log only**: neighborhood_count, neighborhood_analysis_duration_ms, neighborhoods_with_data
- **No PII**: Never log individual addresses or neighborhood names in production
- **Log levels**: info (successful analysis), warn (no neighborhoods found), error (extraction failure)
- **Metrics**: Track neighborhood extraction success rate and performance impact
- **Debug info**: Include neighborhood_count in existing cma_success logs

### **🔒 SECURITY GUARDRAILS**
- **Input sanitization**: Sanitize neighborhood strings (trim, limit length, remove special chars)
- **XSS prevention**: Escape neighborhood names in API responses
- **Data exposure**: No sensitive location data beyond what's already in addresses
- **Error messages**: Safe, generic error messages for neighborhood extraction failures
- **Rate limiting**: Existing API rate limiting applies to neighborhood-enhanced responses

### **💻 CODE QUALITY GUARDRAILS**
- **Pure functions**: Neighborhood extraction must be pure function with no side effects
- **Type hints**: Clear type annotations for all neighborhood-related functions
- **Single responsibility**: Neighborhood extraction handles only address parsing
- **No globals**: No global state or configuration for neighborhood processing
- **Documentation**: Clear docstrings explaining neighborhood extraction logic

### **🧪 TESTING GUARDRAILS**
- **Unit test**: One test for neighborhood extraction function with various address formats
- **Integration test**: Verify neighborhood analysis in API response
- **Edge case testing**: Empty addresses, malformed addresses, addresses without commas
- **Performance test**: Ensure neighborhood analysis doesn't significantly impact API response time
- **Manual validation**: Test with real scraped data to verify neighborhood accuracy

### **🚀 ROLLOUT GUARDRAILS**
- **Feature flag**: Make neighborhood extraction optional via environment variable `ENABLE_NEIGHBORHOOD_ANALYSIS=true`
- **Backward compatibility**: API works identically when neighborhood analysis is disabled
- **Gradual rollout**: Deploy with feature disabled, enable after validation
- **Monitoring**: Track API response times and error rates after neighborhood addition
- **Rollback plan**: Can disable neighborhood analysis without code changes

### **📢 FAILURE MESSAGING GUARDRAILS**
- **Empty neighborhoods**: Return `neighborhoods: {}` with no error message
- **Extraction failure**: Continue with existing response, log error server-side only
- **Invalid data**: Filter out invalid neighborhoods silently, don't expose to client
- **Performance issues**: If neighborhood analysis takes too long, skip it and continue
- **User experience**: Never show technical errors about neighborhood extraction to users

### **🎯 DATA ACCURACY GUARDRAILS**
- **Clear labeling**: Mark neighborhood data as "estimated" in UI
- **Disclaimer**: Include note about neighborhood data accuracy limitations
- **Sample size warnings**: Don't show averages for neighborhoods with <3 properties
- **Transparency**: Be clear about how neighborhoods are extracted from addresses
- **Validation**: Compare neighborhood extraction results with known Philippine geography

### **📋 IMPLEMENTATION PHASE GUARDRAILS**

#### **Phase 1: Basic Implementation**
- **Scope**: Add neighborhood extraction function and basic API integration
- **Validation**: Test with existing scraped data
- **Monitoring**: Track performance impact and error rates
- **Success criteria**: Neighborhood data appears in API responses without breaking existing functionality

#### **Phase 2: Quality Improvements**
- **Scope**: Add neighborhood normalization and validation
- **Validation**: Compare neighborhood accuracy with known areas
- **Monitoring**: Track neighborhood data quality metrics
- **Success criteria**: >80% of neighborhoods correctly identified

#### **Phase 3: Optimization**
- **Scope**: Performance optimization and caching
- **Validation**: Ensure API response times remain acceptable
- **Monitoring**: Track performance improvements
- **Success criteria**: <50ms additional processing time

### **🚫 OUT-OF-SCOPE (FUTURE WORK)**
- **No external APIs** for neighborhood validation or geocoding
- **No machine learning** for neighborhood classification
- **No historical tracking** of neighborhood data over time
- **No advanced analytics** like neighborhood trends or comparisons
- **No user-customizable** neighborhood groupings

### **✅ NEIGHBORHOOD EXTRACTION SUCCESS CRITERIA CHECKLIST**
- [ ] Neighborhood extraction function works with various address formats
- [ ] API response includes neighborhood analysis without breaking existing contract
- [ ] Performance impact <50ms on API response time
- [ ] No errors in neighborhood extraction affect main API functionality
- [ ] Neighborhood data quality >80% accuracy for known areas
- [ ] Feature can be disabled via environment variable
- [ ] All existing tests pass with neighborhood extraction enabled
- [ ] Manual testing with real scraped data validates neighborhood accuracy

---

## **PSGC ADDRESS SEARCH CONTEXT ENGINEERING**

### **1. INTEGRATION CONSTRAINT LAYER**

**What it means:** *Forces implementation to use lightweight JSON database approach instead of complex ph-address integration.*

```
PSGC_LIGHTWEIGHT_DATABASE_CONTEXT:
"PSGC address search implementation constraints:
- Use lightweight JSON database (backend/data/philippine_addresses.json)
- NO ph-address library integration (avoid 50MB database complexity)
- NO SQLite database (keep it simple and fast)
- Backend processes JSON file in-memory for fast lookups
- Frontend makes API calls to /api/addresses/search endpoint
- Structured output feeds CMA scraper targeting
- Direct implementation: Real data from day one, no mock phases"
```

### **2. DATA STRUCTURE INTEGRITY CONTEXT**

**What it means:** *Ensures PSGC codes and address data maintain official government standards.*

```
PSGC_DATA_INTEGRITY_CONTEXT:
"PSGC data structure requirements:
- All addresses MUST have valid PSGC city codes (8 digits)
- All addresses MUST have valid PSGC province codes (4 digits)
- Coordinates MUST be accurate [latitude, longitude] format
- Address strings MUST follow official Philippine format
- Confidence levels MUST be 'high' | 'medium' | 'low' only
- Search radius MUST be realistic (1-50km range)
- NO invalid or placeholder PSGC codes in production data"
```

### **3. BACKEND API PATTERN ENFORCEMENT**

**What it means:** *Forces implementation to follow existing Flask patterns and avoid over-engineering.*

```
PSGC_BACKEND_API_PATTERN_CONTEXT:
"Backend API implementation MUST follow existing patterns:
1. Add @app.get('/api/addresses/search') endpoint to existing app.py
2. Reuse existing input validation patterns from /api/cma
3. Reuse existing error handling and response formatting
4. Use existing CORS configuration (no changes needed)
5. Follow existing logging patterns (no PII in logs)
6. Return AddressSearchResponse format exactly as defined
7. NO complex database connections or ORM layers"
```

---

## **FRONTEND INTEGRATION CONTEXT ENGINEERING**

### **1. SWAP POINT IMPLEMENTATION CONTEXT**

**What it means:** *Ensures the frontend swap point is implemented correctly without breaking existing functionality.*

```
PSGC_FRONTEND_SWAP_CONTEXT:
"Frontend swap point implementation requirements:
- Replace ONLY the mockSearchAddresses() function call
- Keep ALL existing error handling and loading states
- Keep ALL existing caching and debouncing logic
- Keep ALL existing TypeScript interfaces unchanged
- Update ONLY line 264 in useAddressSearch.ts
- NO changes to AddressInput component
- NO changes to App.tsx integration
- NO changes to data flow or state management"
```

### **2. API INTEGRATION SAFETY CONTEXT**

**What it means:** *Ensures API integration handles network issues gracefully without breaking user experience.*

```
PSGC_API_SAFETY_CONTEXT:
"Frontend API integration safety requirements:
- Handle 404 errors gracefully (endpoint not found)
- Handle 500 errors gracefully (server errors)
- Handle network timeouts gracefully (5 second timeout)
- Fallback to cached results if API unavailable
- Show clear error messages to users
- Maintain existing loading states and UX
- NO breaking changes to existing component behavior"
```

### **3. DATA FLOW VALIDATION CONTEXT**

**What it means:** *Ensures PSGC codes flow correctly from address search to CMA generation.*

```
PSGC_DATA_FLOW_CONTEXT:
"PSGC data flow validation requirements:
- Address search returns valid PSGC codes
- PSGC codes pass through to CMA generation unchanged
- No data transformation or validation in frontend
- Backend validates PSGC codes before scraper execution
- Error handling at each step of the data flow
- NO raw user input reaches the scraper
- NO PSGC code manipulation in frontend"
```

---

## **DATA VALIDATION AND SECURITY CONTEXT**

### **1. INPUT SANITIZATION CONTEXT**

**What it means:** *Protects the address search API from malicious input and ensures data integrity.*

```
PSGC_INPUT_SANITIZATION_CONTEXT:
"Address search input validation requirements:
- Query parameter MUST be string, max 100 characters
- Query parameter MUST be sanitized (trim, encode)
- Limit parameter MUST be integer, 1-10 range
- NO SQL injection vectors (JSON database, not SQL)
- NO XSS vectors (output properly encoded)
- NO path traversal vectors (no file system access)
- Rate limiting: 100 requests per minute per IP"
```

### **2. PSGC CODE VALIDATION CONTEXT**

**What it means:** *Ensures PSGC codes are valid and properly formatted before use.*

```
PSGC_CODE_VALIDATION_CONTEXT:
"PSGC code validation requirements:
- City codes MUST be 8 digits (e.g., '137602000')
- Province codes MUST be 4 digits (e.g., '1376')
- Codes MUST be numeric only (no letters or symbols)
- Codes MUST exist in official PSGC database
- Invalid codes MUST be rejected with clear error messages
- NO partial or malformed PSGC codes accepted
- Validation MUST happen on both frontend and backend"
```

### **3. DATA PRIVACY CONTEXT**

**What it means:** *Protects user privacy and prevents data exposure.*

```
PSGC_DATA_PRIVACY_CONTEXT:
"Address search data privacy requirements:
- NO logging of user search queries
- NO storage of user search history
- NO tracking of user address selections
- API responses contain NO sensitive information
- Error logs contain NO user data
- Caching in localStorage only (client-side)
- NO server-side storage of search data"
```

---

## **PERFORMANCE AND RELIABILITY CONTEXT**

### **1. RESPONSE TIME CONSTRAINTS**

**What it means:** *Ensures address search feels responsive despite network calls.*

```
PSGC_PERFORMANCE_CONTEXT:
"Address search performance requirements:
- API response time MUST be <100ms for typical searches
- Frontend debouncing MUST be 300ms (existing)
- Total user experience MUST feel <500ms
- JSON database MUST be loaded once at startup
- Search algorithm MUST be O(n) linear search
- Results MUST be limited to top 5 matches
- Caching MUST reduce API calls by 80%+"
```

### **2. ERROR HANDLING AND RESILIENCE**

**What it means:** *Ensures the system handles failures gracefully without breaking user experience.*

```
PSGC_ERROR_RESILIENCE_CONTEXT:
"Address search error handling requirements:
- Network errors MUST show retry option
- Server errors MUST show fallback message
- Invalid queries MUST show helpful suggestions
- Timeout errors MUST show clear timeout message
- API unavailable MUST fallback to cached results
- NO crashes or broken UI states
- Error messages MUST be user-friendly"
```

### **3. CACHING STRATEGY CONTEXT**

**What it means:** *Ensures caching improves performance without causing data staleness.*

```
PSGC_CACHING_CONTEXT:
"Address search caching requirements:
- Cache successful searches in localStorage
- Cache expiry MUST be 24 hours
- Cache size MUST be limited to 100 entries
- Cache MUST be cleared on app restart
- Cache MUST not interfere with real-time data
- Cache MUST be validated before use
- NO sensitive data in cache"
```

---

## **IMPLEMENTATION PATTERN ENFORCEMENT**

### **1. BACKEND IMPLEMENTATION PATTERN**

**What it means:** *Forces implementation to follow the exact backend pattern established in the codebase.*

```
PSGC_BACKEND_IMPLEMENTATION_PATTERN:
"Backend implementation MUST follow this exact pattern:
1. Create backend/data/philippine_addresses.json with 200+ addresses
2. Add @app.get('/api/addresses/search') to existing app.py
3. Reuse existing validation patterns from /api/cma endpoint
4. Reuse existing error handling and response formatting
5. Load JSON database once at startup (not per request)
6. Implement simple linear search algorithm
7. Return AddressSearchResponse format exactly as defined
8. NO complex database connections or ORM layers"
```

### **2. FRONTEND IMPLEMENTATION PATTERN**

**What it means:** *Forces implementation to follow the exact frontend pattern established in the codebase.*

```
PSGC_FRONTEND_IMPLEMENTATION_PATTERN:
"Frontend implementation MUST follow this exact pattern:
1. Update ONLY line 264 in useAddressSearch.ts
2. Replace mockSearchAddresses() with fetch() call
3. Keep ALL existing error handling unchanged
4. Keep ALL existing caching logic unchanged
5. Keep ALL existing loading states unchanged
6. Keep ALL existing TypeScript interfaces unchanged
7. NO changes to AddressInput component
8. NO changes to App.tsx integration"
```

### **3. DATA FLOW PATTERN ENFORCEMENT**

**What it means:** *Ensures the data flow follows the established pattern from address search to CMA generation.*

```
PSGC_DATA_FLOW_PATTERN:
"Data flow MUST follow this exact pattern:
1. User types → Frontend debounces → API call to /api/addresses/search
2. Backend searches JSON database → Returns structured suggestions
3. User selects → Frontend creates KairosAddressOutput with PSGC codes
4. User clicks Generate → Frontend calls /api/cma with PSGC codes
5. Backend validates PSGC codes → Runs scraper with province mapping
6. Backend returns CMA data → Frontend displays results
7. NO data transformation between steps
8. NO validation in frontend (backend only)"
```

---

## **FUTURE-PROOFING AND EXPANSION CONTEXT**

### **1. SCALABILITY PREPARATION**

**What it means:** *Ensures the implementation can scale without major architectural changes.*

```
PSGC_SCALABILITY_CONTEXT:
"Address search scalability requirements:
- JSON database MUST be easily expandable to 1000+ addresses
- Search algorithm MUST remain fast with larger datasets
- API response time MUST remain <100ms with growth
- Memory usage MUST remain reasonable (<10MB)
- NO database migrations needed for expansion
- NO code changes needed for new addresses
- Easy to add new provinces and regions"
```

### **2. MAINTENANCE AND UPDATES**

**What it means:** *Ensures the implementation is easy to maintain and update.*

```
PSGC_MAINTENANCE_CONTEXT:
"Address search maintenance requirements:
- Address database MUST be easily updatable
- PSGC codes MUST be easily verifiable
- Error handling MUST be easily debuggable
- Performance MUST be easily monitorable
- Code MUST be easily testable
- Documentation MUST be easily maintainable
- NO complex dependencies or frameworks"
```

### **3. EXPANSION STRATEGY**

**What it means:** *Ensures the implementation can grow into a full ph-address integration later.*

```
PSGC_EXPANSION_CONTEXT:
"Address search expansion strategy:
- Current implementation MUST be easily replaceable
- API contract MUST remain stable during expansion
- Frontend code MUST not need changes for expansion
- Backend can swap JSON database for ph-address later
- Data structure MUST remain compatible
- Performance MUST improve with expansion
- NO breaking changes to existing functionality"
```

---

## **CRITICAL IMPLEMENTATION RULES**

### **PSGC ADDRESS SEARCH RULES**
```
# PSGC ADDRESS SEARCH IMPLEMENTATION RULES
- Use lightweight JSON database - never implement ph-address integration
- Follow existing Flask patterns - reuse validation and error handling
- Implement swap point only - no other frontend changes needed
- Validate PSGC codes - ensure data integrity and security
- Cache aggressively - improve performance and user experience
- Handle errors gracefully - maintain reliability and user experience
- Keep it simple - avoid over-engineering and technical debt
```

### **DATA INTEGRITY RULES**
```
# PSGC DATA INTEGRITY RULES
- All PSGC codes must be valid and properly formatted
- All addresses must follow official Philippine format
- All coordinates must be accurate and properly formatted
- All data must be validated before use
- No invalid or placeholder data in production
- No data transformation in frontend
- No raw user input reaches the scraper
```

### **PERFORMANCE RULES**
```
# PSGC PERFORMANCE RULES
- API response time must be <100ms
- Frontend debouncing must be 300ms
- Total user experience must feel <500ms
- Cache must reduce API calls by 80%+
- Search algorithm must be O(n) linear
- Results must be limited to top 5 matches
- No complex database queries or joins
```

---

## **IMPLEMENTATION CHECKLIST**

### **Backend Implementation**
- [ ] Create `backend/data/philippine_addresses.json` with 200+ addresses
- [ ] Add `@app.get('/api/addresses/search')` endpoint to `app.py`
- [ ] Implement input validation (query, limit parameters)
- [ ] Implement PSGC code validation
- [ ] Implement linear search algorithm
- [ ] Implement error handling and response formatting
- [ ] Test API endpoint with various queries
- [ ] Verify response format matches `AddressSearchResponse`

### **Frontend Implementation**
- [ ] Update line 264 in `useAddressSearch.ts` (swap point)
- [ ] Replace `mockSearchAddresses()` with `fetch()` call
- [ ] Add proper error handling for network requests
- [ ] Test with various search queries
- [ ] Verify caching still works
- [ ] Verify loading states still work
- [ ] Test error scenarios (network failures, timeouts)

### **Integration Testing**
- [ ] Test address search functionality end-to-end
- [ ] Test CMA generation with real PSGC codes
- [ ] Test error handling and fallbacks
- [ ] Test performance with various queries
- [ ] Test caching behavior
- [ ] Verify no breaking changes to existing functionality

---

## **DESIGN SYSTEM PROTECTION GUARDRAILS**

### **CRITICAL RULE: NO UI/UX CHANGES WITHOUT EXPLICIT PERMISSION**

**Context:** After implementing the PSGC address search system, unauthorized changes were made to the dashboard layout and button styling that violated the established Kairos design system. This section establishes absolute protection for the visual design and user experience.

### **1. ABSOLUTE PROHIBITIONS**

**❌ NEVER CHANGE WITHOUT PERMISSION:**
- **Dashboard Layout**: Grid structure, component arrangement, spacing, responsive breakpoints
- **Visual Design**: Colors, typography, shadows, borders, backgrounds, card styling
- **Component Styling**: Button colors, input field designs, hover states, transitions
- **Layout Structure**: Container sizes, positioning, alignment, spacing systems
- **UX Flow**: Navigation patterns, interactions, loading states, error displays
- **Design System Compliance**: Any deviation from established Kairos visual standards

### **2. MANDATORY APPROVAL PROCESS**

**✅ ALWAYS ASK FIRST:**
```
Before making ANY visual, layout, or UX change:
1. STOP - Do not implement the change
2. ASK - "Should I change [specific thing] to [specific change]?"
3. WAIT - Get explicit permission before proceeding
4. CONFIRM - Verify the exact change requested
```

**Example Questions:**
- "Should I change the button color to match the design system?"
- "Should I update the dashboard layout to fix the grid structure?"
- "Should I modify the card styling for better visual consistency?"
- "Should I adjust the spacing or typography?"

### **3. DESIGN SYSTEM REFERENCE**

**Established Standards:**
- **Button Colors**: Primary buttons use `bg-black hover:bg-gray-800 text-white`
- **Card Backgrounds**: Dashboard cards use `bg-kairos-chalk` (#FFFFFC)
- **Layout Structure**: 4-column metrics, 2x2 analysis grid, full-width historical
- **Typography**: `text-xl` for metric values, `text-xs` for labels
- **Spacing**: `space-y-8` for sections, `gap-6` for grids, `p-6` for cards

### **4. EXCEPTIONS**

**✅ ALLOWED WITHOUT PERMISSION:**
- **Bug fixes** that restore intended functionality
- **Breaking changes** that prevent the app from working
- **Security issues** that expose vulnerabilities
- **Performance optimizations** that don't affect visual appearance

### **5. VIOLATION CONSEQUENCES**

**⚠️ ENFORCEMENT:**
- Any unauthorized UI/UX change will result in immediate rollback
- This guardrail reminder will be triggered
- Future changes require explicit permission before implementation

### **6. IMPLEMENTATION CONTEXT**

```
DESIGN_SYSTEM_PROTECTION_CONTEXT:
"Kairos visual design and UX are sacred and must never be modified without explicit permission:
- Dashboard layout follows established 3-level hierarchy
- All components use documented color palette and typography
- Button styling follows design system specifications exactly
- Grid structure maintains professional, clean appearance
- Any visual change requires approval before implementation
- Preserve the 'calm in the chaos' design philosophy"
```

---

**These guardrails ensure the Kairos design system maintains its professional, cohesive appearance without unauthorized modifications that could break the user experience or visual consistency.**

---

## **INLINE TOGGLE & COMPARISONS DROPDOWN DESIGN GUARDRAILS**

### **CRITICAL RULE: DESIGN DRIFT PREVENTION**

**Context:** After multiple sessions of dropdown styling changes that repeatedly drifted from the original design, these guardrails establish canonical visual specifications that must NOT be modified without explicit permission.

---

### **INCIDENT REPORT: DROPDOWN DESIGN DRIFT (October 2024)**

#### **What Happened**

A chat session focused on restoring the Comparisons dropdown to its "original beautiful design" resulted in repeated styling changes that kept drifting from the intended state. The user experienced frustration as changes weren't persisting or kept being modified across multiple attempts.

#### **Root Causes Identified**

1. **Lack of Design Checkpoints**
   - No documented "source of truth" for correct dropdown styling
   - Each change removed context about why previous decisions were made
   - No clear reference for what the "original beautiful design" actually was

2. **Scope Drift**
   - Multiple simultaneous changes to dropdown styling
   - Attempts to create new components (CustomSelect) instead of fixing styling
   - Wholesale code replacements instead of surgical changes

3. **Missing Protection Mechanisms**
   - No guardrails preventing unauthorized design modifications
   - No verification checklist to ensure design integrity
   - No change request protocol requiring explicit permission

4. **Over-Engineering Attempts**
   - Proposals to add dropdown libraries (react-select, headlessui)
   - Suggestions to refactor into new components
   - Complex solutions for simple styling problems

#### **Key Insights from Analysis**

**The Real Problem Wasn't Code:**
- The InlineToggle component was already minimal and correct
- The dropdown styling was already aligned with design system
- The issue was PROCESS, not implementation

**What Actually Needed Protection:**
- InlineToggle: Transparent background, no border, minimal styling
- Dropdown Panel: rounded-3xl, bg-white/95, shadow-lg
- Color Palette: #E5E4E6, #F3F3F2, #3B3832, #7A7873
- Design Philosophy: "Calm in the chaos" - minimal, professional

**User's Instinct Was Correct:**
> "wait whoa whoa, what I'm asking you to do is very simple"

The moment of clarity - recognizing that AI was over-engineering a simple visual consistency problem.

#### **Solution Implemented**

**Three-Layer Protection System:**

1. **Inline Code Documentation**
   - Added design checkpoint comments to InlineToggle.tsx (30+ lines)
   - Added design checkpoint comments to App.tsx dropdown (40+ lines)
   - Documents WHY each design decision was made
   - Lists protected elements that cannot be changed

2. **Project-Level Guardrails**
   - Comprehensive section in KAIROS-GUARDRAILS.md (250+ lines)
   - Component protection rules with exact CSS classes
   - Color palette specification with locked values
   - Visual verification checklist (15 points)
   - Change request protocol (7 steps)
   - Anti-patterns explicitly forbidden
   - Enforcement rules with consequences

3. **Quick Reference Rules**
   - Added to Critical Cursor Rules section
   - One-liner summaries for fast lookup
   - Clear prohibitions on unauthorized changes

#### **Technical Implementation Details**

**Zero Technical Bloat Added:**
- ✅ No new components created
- ✅ No new dependencies added
- ✅ No new files created
- ✅ No code complexity increased
- ✅ Only documentation and comments

**Flawless Integration:**
- ✅ Inline comments in existing code
- ✅ Additions to existing guardrails document
- ✅ Uses existing design system
- ✅ Follows existing conventions

#### **Visual Verification Checklist Created**

**InlineToggle Component:**
- [ ] Trigger has NO background color
- [ ] Trigger has NO border
- [ ] Trigger has NO shadow
- [ ] Label text has pseudo-bold effect (fontWeight: '700' + textShadow)
- [ ] Hover shows underline only (no background change)
- [ ] Chevron rotates smoothly (180deg on open)

**Comparisons Dropdown:**
- [ ] Panel uses `rounded-3xl` corners
- [ ] Panel has `shadow-lg` (visible but subtle)
- [ ] Panel background is `bg-white/95`
- [ ] Property Type/Location inputs have `bg-[#F3F3F2]`
- [ ] All borders use `border-[#E5E4E6]`
- [ ] Section padding is generous (`p-4`)
- [ ] Input heights are consistent (`h-10`)

**Overall Feel:**
- [ ] Design feels "calm and minimal"
- [ ] No visual noise or competing elements
- [ ] Generous spacing reduces cognitive load
- [ ] Colors are neutral and professional
- [ ] Matches dashboard card styling

#### **Change Request Protocol Established**

**IF YOU NEED TO MODIFY DROPDOWN/TOGGLE STYLING:**

1. **STOP** - Do not make the change yet
2. **READ** - Review this guardrail section completely
3. **DOCUMENT** - Write down EXACTLY what you want to change and WHY
4. **ASK** - Get explicit permission: "Should I change [X] to [Y] because [reason]?"
5. **WAIT** - Do not proceed until you receive clear approval
6. **VERIFY** - After change, run through visual verification checklist
7. **TEST** - Ensure change doesn't break other components

#### **Prevention of Future Drift**

**Multiple Checkpoints System:**
```
Developer/AI wants to change dropdown
    ↓
Sees inline checkpoint comment → "DO NOT CHANGE WITHOUT PERMISSION"
    ↓
Checks KAIROS-GUARDRAILS.md → Detailed rules and restrictions
    ↓
Reviews Critical Cursor Rules → Quick reference restrictions
    ↓
Follows Change Request Protocol → Must ask permission first
    ↓
Runs Visual Verification Checklist → Confirms design integrity
```

#### **Lessons Learned**

**Do:**
- ✅ Document design decisions inline with code
- ✅ Create verification checklists for visual changes
- ✅ Require explicit permission for design modifications
- ✅ Use documentation to prevent problems, not code
- ✅ Trust user instincts about simplicity

**Don't:**
- ❌ Make wholesale code replacements for styling issues
- ❌ Create new components for simple visual problems
- ❌ Add libraries when existing code works fine
- ❌ Over-engineer simple solutions
- ❌ Change designs without clear approval

#### **Key Principle Established**

> **"The best code is the code you don't write. The best fix is documentation that prevents the problem."**

The dropdown was already correct. It needed **protection through documentation**, not code changes.

#### **Files Modified**

1. `Kairos/src/components/InlineToggle.tsx` - Added design checkpoint comment
2. `Kairos/src/App.tsx` - Added design checkpoint comment for dropdown
3. `KAIROS-GUARDRAILS.md` - Added comprehensive guardrail section

**Total Lines Added:** ~320 lines of documentation
**Code Changes:** 0 (only comments added)
**Dependencies Added:** 0
**Technical Debt:** 0

#### **Success Metrics**

**This Implementation:**
- ✅ Prevents design drift permanently
- ✅ Enforces "calm in the chaos" philosophy
- ✅ Protects against unauthorized changes
- ✅ Requires explicit permission for modifications
- ✅ Provides clear verification mechanism
- ✅ Adds zero technical complexity
- ✅ Integrates flawlessly with existing system

**Future Impact:**
- Design drift impossible without explicit permission
- Clear reference for "correct" visual state
- Systematic verification before commits
- Protection scales to other components if needed

#### **Related Sections**

- See [Component Protection Rules](#1-inline-toggle-component-protection) below for detailed specifications
- See [Visual Verification Checklist](#4-visual-verification-checklist) for commit verification
- See [Change Request Protocol](#5-change-request-protocol) for modification process
- See [Critical Cursor Rules](#critical-cursor-rules) for quick reference

---

**Date:** October 9, 2025  
**Status:** ✅ Guardrails implemented and active  
**Prevention:** Design drift incidents eliminated through documentation

---

### **1. INLINE TOGGLE COMPONENT PROTECTION**

#### **CANONICAL STYLING (LOCKED)**

**Component:** `Kairos/src/components/InlineToggle.tsx`

**Protected Classes:**
```tsx
className={`inline-flex items-center gap-1.5 px-1.5 py-1 text-sm font-medium 
  transition-colors duration-150 focus-visible:outline-none 
  focus-visible:ring-2 focus-visible:ring-kairos-charcoal/20 
  text-kairos-charcoal/80 hover:text-kairos-charcoal`}
```

**MUST HAVE:**
- ✅ NO background color (transparent)
- ✅ NO border
- ✅ NO shadow
- ✅ Minimal padding: `px-1.5 py-1`
- ✅ Text color: `text-kairos-charcoal/80 hover:text-kairos-charcoal`
- ✅ Gap: `gap-1.5` between label and chevron
- ✅ Font weight via inline style (not className): `fontWeight: '700'`
- ✅ Text shadow for pseudo-bold: `textShadow: '0.5px 0 0 currentColor'`
- ✅ Hover underline: `hover:underline underline-offset-2 decoration-kairos-charcoal/40`

**MUST NOT HAVE:**
- ❌ Any `bg-*` class
- ❌ Any `border` or `border-*` class
- ❌ Any `shadow-*` class
- ❌ Any `rounded-*` class
- ❌ Font weight className (keep inline style)

**WHY THIS STYLING:**
- Transparent background: Doesn't compete with page content
- No visual chrome: Reduces cognitive load
- Minimal padding: Professional, compact appearance
- Text-only treatment: "Calm in the chaos" philosophy
- Subtle hover: Provides affordance without distraction

---

### **2. COMPARISONS DROPDOWN PANEL PROTECTION**

#### **CANONICAL STYLING (LOCKED)**

**Component:** `Kairos/src/App.tsx` (Comparisons dropdown)

**Panel Container Classes:**
```tsx
className="absolute top-full left-0 right-0 mt-2 z-50 
  bg-white/95 border border-[#E5E4E6] rounded-3xl shadow-lg"
```

**MUST HAVE:**
- ✅ Border radius: `rounded-3xl` (NOT rounded-lg, NOT rounded-xl)
- ✅ Background: `bg-white/95` (95% opacity white)
- ✅ Border: `border border-[#E5E4E6]`
- ✅ Shadow: `shadow-lg` (NOT shadow-sm, NOT shadow-xl)
- ✅ Positioning: `absolute top-full left-0 right-0 mt-2`
- ✅ z-index: `z-50`

**Property Type / Location Selector Classes:**
```tsx
className="w-full h-10 px-3 pr-10 text-left 
  border border-[#E5E4E6] rounded bg-[#F3F3F2]"
```

**MUST HAVE:**
- ✅ Background: `bg-[#F3F3F2]`
- ✅ Border: `border border-[#E5E4E6]`
- ✅ Border radius: `rounded` (standard, NOT rounded-xl)
- ✅ Height: `h-10`
- ✅ Right padding: `pr-10` (for chevron icon)

**Section Styling:**
- ✅ Padding: `p-4` (generous, consistent)
- ✅ Dividers: `border-b border-[#E5E4E6]`

---

### **3. COLOR PALETTE (LOCKED)**

**Protected Colors:**
```
#FFFFFC - kairos-chalk (card backgrounds)
#F3F3F2 - Input field backgrounds
#E5E4E6 - Borders and dividers
#3B3832 - Primary text
#7A7873 - Placeholder text
#6B7280 - Icon gray
```

**NEVER CHANGE:**
- Dropdown panel transparency (white/95)
- Border colors (#E5E4E6)
- Input backgrounds (#F3F3F2)
- Text colors (#3B3832, #7A7873)

---

### **4. VISUAL VERIFICATION CHECKLIST**

**Before Committing ANY Dropdown/Toggle Changes:**

**InlineToggle Component:**
- [ ] Trigger has NO background color
- [ ] Trigger has NO border
- [ ] Trigger has NO shadow
- [ ] Label text has pseudo-bold effect (fontWeight: '700' + textShadow)
- [ ] Hover shows underline only (no background change)
- [ ] Chevron rotates smoothly (180deg on open)

**Comparisons Dropdown:**
- [ ] Panel uses `rounded-3xl` corners
- [ ] Panel has `shadow-lg` (visible but subtle)
- [ ] Panel background is `bg-white/95`
- [ ] Property Type/Location inputs have `bg-[#F3F3F2]`
- [ ] All borders use `border-[#E5E4E6]`
- [ ] Section padding is generous (`p-4`)
- [ ] Input heights are consistent (`h-10`)

**Overall Feel:**
- [ ] Design feels "calm and minimal"
- [ ] No visual noise or competing elements
- [ ] Generous spacing reduces cognitive load
- [ ] Colors are neutral and professional
- [ ] Matches dashboard card styling

---

### **5. CHANGE REQUEST PROTOCOL**

**IF YOU NEED TO MODIFY DROPDOWN/TOGGLE STYLING:**

1. **STOP** - Do not make the change yet
2. **READ** - Review this guardrail section completely
3. **DOCUMENT** - Write down EXACTLY what you want to change and WHY
4. **ASK** - Get explicit permission: "Should I change [X] to [Y] because [reason]?"
5. **WAIT** - Do not proceed until you receive clear approval
6. **VERIFY** - After change, run through visual verification checklist
7. **TEST** - Ensure change doesn't break other components

**Example Request:**
> "Should I change the dropdown shadow from shadow-lg to shadow-xl to increase depth? 
> Reason: Better visual hierarchy with the page background."

**Wait for response before implementing.**

---

### **6. ANTI-PATTERNS TO PREVENT**

**❌ NEVER DO THIS:**

**Over-Engineering:**
- "Let me create a CustomSelect component to manage this better"
- "Let me add a dropdown library (react-select, headlessui)"
- "Let me refactor this into smaller components"

**Wholesale Replacement:**
- "Let me replace the entire dropdown with this new implementation"
- "Let me copy styling from another project"
- "Let me start fresh with a cleaner approach"

**Unauthorized Changes:**
- Changing border radius without asking
- Adjusting colors to "improve" them
- Adding shadows or backgrounds for "better UX"
- Modifying spacing to "optimize" layout

**Scope Creep:**
- "While I'm here, let me improve the calendar dropdown too"
- "Let me standardize all dropdowns across the app"
- "Let me add animation libraries for better transitions"

---

### **7. ENFORCEMENT**

**⚠️ VIOLATION CONSEQUENCES:**

If unauthorized changes are made to InlineToggle or Comparisons dropdown:
1. **Immediate rollback** to last known good state
2. **This guardrail document** will be cited
3. **Change request protocol** must be followed for future attempts
4. **Visual verification checklist** must be completed before committing

**Git Tags for Known Good States:**
- `dropdown-design-checkpoint-2024-10` - Canonical dropdown styling
- See git history for visual reference points

---

### **8. PHILOSOPHY REMINDER**

**"Calm in the Chaos" Design Principles:**

> Every element should REDUCE cognitive load, not add to it.

**InlineToggle embodies this:**
- Transparent (invisible until needed)
- Text-focused (content over chrome)
- Minimal (no decoration)
- Subtle (gentle affordance)

**Comparisons Dropdown embodies this:**
- Clean layout (generous spacing)
- Neutral colors (no visual competition)
- Clear hierarchy (size and position, not color)
- Professional depth (subtle shadows)

**Any change that adds visual noise, complexity, or decoration violates this philosophy.**

---

### **9. QUICK REFERENCE**

**InlineToggle One-Liner:**
> "Transparent button with text-only styling, no background, no border, no shadow, minimal padding, subtle hover underline."

**Comparisons Dropdown One-Liner:**
> "White/95 panel with rounded-3xl corners, shadow-lg depth, light gray inputs, generous p-4 padding, neutral borders."

**When In Doubt:**
> "Don't change it. Ask first."

---

### **10. RELATED DOCUMENTATION**

- **Inline Comments:** See `InlineToggle.tsx` and `App.tsx` for detailed design checkpoint comments
- **Design System:** See KAIROS-DASHBOARD-DESIGN-SYSTEM.md for overall visual standards
- **Protection Rules:** See DESIGN SYSTEM PROTECTION GUARDRAILS section above
- **User Preferences:** See user_rules for style preferences and philosophy

---

**These guardrails prevent design drift by establishing clear, documented, enforceable standards for dropdown and toggle components. Any modification requires explicit permission and must pass visual verification.**

---

## **DATATABLE MODAL IMPLEMENTATION GUARDRAILS**

### **Scope and Change Control**

- **Only implement exactly this**: harden scraper extraction, complete adapter normalization, add a small modal data table, wire "View" button.
- **No new features**: no charts, filters, pagination, exports, or global state for this phase.
- **No redesigns**: preserve existing layouts, component hierarchy, and API shapes.

### **Dependencies and Footprint**

- **No new libraries**: use existing React, TypeScript, Tailwind, and current UI primitives.
- **Single new component**: add only `DataTable.tsx` under `dashboard/`.
- **No shared utils** unless reused across ≥2 places; keep formatting inline for this phase.

### **API Contract and Data Flow**

- **Contract freeze**: Keep backend response as `{ properties, stats, neighborhoods, data_source }`; allow optional `meta.reason` on empty (already present).
- **Normalization keys**: Keep `price`, `bedrooms`, `bathrooms`, `sqm`, `url`, `coordinates`, `address`, `neighborhood`, `property_type` as-is.
- **Coordinates optional**: `coordinates` may be `null`; UI must tolerate it without branching logic.

### **Backend Changes (Minimal and Internal)**

- **Scraper**: Fix syntax and ensure `staging_df` maps to columns: `SKU`, `Location`, `TCP`, `Bedrooms`, `Baths`, `Floor_Area`, `Source`. No structural changes to pipeline or output files.
- **Adapter**:
    - Add `'latitude'`/`'longitude'` to missing-column guard.
    - Implement `_build_coordinates` to coerce or return `None`.
    - Do not add/rename normalized fields; keep mapping stable.
- **Logging**: Fix only obvious syntax issues; no new logging categories or PII.

### **Frontend Integration (Small and Local)**

- **DataTable**:
    - Create a self-contained modal with `open`, `onClose`, `properties` props.
    - Use `Card`/`Button` and existing Tailwind classes; no new modal library.
    - Show a fixed, simple table: Property ID, Address, City, Province, Bedrooms, Bathrooms, Floor Area, Price.
    - Graceful fallbacks: display empty cells for missing values; format price with `toLocaleString`.
- **Wiring**:
    - Add `isDataTableOpen` state in `App.tsx` only.
    - Pass `onOpenDataTable` to `PropertyReport`; wire existing "View" button to open modal.
    - Do not introduce context, reducers, or global stores.

### **UI/UX and Design System**

- **Visuals**: White cards, subtle shadows, `rounded-3xl`, neutral grays. No new colors or visual flourishes.
- **Layout**: Centered, calm, generous spacing. No extra panels or navigation.
- **Text and labels**: Keep concise; no explanatory microcopy added in this phase.
- **Accessibility**: Modal must close on ESC and backdrop click; trap focus while open.

### **Security and Reliability**

- **No raw HTML injection**; render plain text in table cells.
- **Sanitize/safely format** price strings; avoid evaluating URLs (just render as text if included).
- **Backend**: Keep timeouts and single-flight lock behaviors; do not expose stack traces or PII in logs.

### **Performance and Scalability**

- **Data size cap**: Respect existing cap (≤100 properties in response); table renders that list without virtualizing for now.
- **Avoid heavy computation**: No sorting/grouping on the client; display as-is.
- **No extra fetches**: Data flows from existing CMA call only.

### **Testing and QA**

- **Backend sanity**: POST `/api/cma` with Metro Manila condos (10–20 count). Expect `stats.count > 0` when data is present, `properties.length ≤ 100`, optional `meta.reason` on empty.
- **Frontend checks**: Modal opens/closes, scrolls on small screens, keyboard accessible, fields render with empty cells when absent, price formatting correct.
- **Non-regression**: `PropertyReport` still shows Top 5; other dashboard cards unchanged.

### **Documentation and Maintenance**

- **Inline comments**: Only when rationale is non-obvious (e.g., coordinates coercion rules).
- **No README churn**: Skip broad docs; add a short note if needed near `DataTable.tsx` explaining its purpose and contract.
- **Naming**: Use clear, descriptive prop and variable names; avoid abbreviations.

### **"Done" Criteria**

- "View" opens a modal table populated by live CMA data without adding dependencies or changing API shapes.
- Scraper and adapter produce normalized properties reliably; `coordinates` optional and safe.
- UI matches design system; no visual or behavioral regressions.
- All QA checks pass with real responses; no console or server errors.

**These guardrails ensure the DataTable implementation delivers exactly the requested phase outcome with zero technical bloat and a flawless fit into the current system.**

---

## **CMA SUMMARY TABLE IMPLEMENTATION GUARDRAILS**

**Created:** October 7, 2025

**Context:** Replication of DataTable modal pattern for CMA Summary metrics display

**First Principles:** Extracted from KAIROS-GUARDRAILS.md DataTable implementation

---

### **FIRST PRINCIPLES FOUNDATION**

These are the fundamental truths that underpin all implementation decisions:

1. **Minimal Technical Debt** → Zero new dependencies, single new component
2. **Contract Stability** → Never modify existing API or data shapes
3. **Design System Sacred** → Visual consistency is non-negotiable
4. **Data Reality Over Fantasy** → Real data first, clearly labeled mocks when necessary
5. **No Breaking Changes** → Don't touch what works
6. **Fast Shipping** → Bounded time, ship at "good enough"
7. **Security Always** → Sanitize everything, expose nothing
8. **Pattern Reuse** → If DataTable works, copy it exactly

---

### **1. SCOPE AND CHANGE CONTROL**

#### **✅ ALLOWED:**

- Create `CMASummaryTable.tsx` component (ONE new file only)
- Modify `CMASummary.tsx` to add `onOpenCMASummary` prop (8 lines)
- Modify `App.tsx` to add state + render modal (4 lines)

#### **❌ PROHIBITED:**

- No new npm packages or dependencies
- No modifications to backend/API
- No changes to existing component layouts
- No new shared utility files
- No modifications to existing dashboard cards
- No changes to design system
- No global CSS modifications

#### **QUANTITATIVE LIMITS:**

- Total new lines of code: ≤160 lines
- Files created: 1
- Files modified: 2
- Implementation time: ≤30 minutes
- Dependencies added: 0

---

### **2. PATTERN REPLICATION GUARDRAIL**

#### **MANDATORY PATTERN:**

```
DataTable.tsx structure → CMASummaryTable.tsx structure
PropertyReport wiring → CMASummary wiring
App.tsx integration → Identical integration pattern
```

#### **COPY-PASTE CHECKLIST:**

- [ ] Modal backdrop: `bg-black/30` with fade transition
- [ ] Card container: `rounded-3xl`, `shadow-sm`, white background
- [ ] Header: `p-4 border-b`, title + close button
- [ ] ESC key handler
- [ ] Backdrop click handler
- [ ] Focus trap implementation
- [ ] Entry animation: fade + scale (250ms)
- [ ] `stopPropagation()` on button click

#### **ANTI-PATTERN:**

```
❌ DON'T create "improved" or "enhanced" modal pattern
❌ DON'T add new animations or transitions
❌ DON'T change the existing modal structure
✅ DO copy DataTable.tsx structure exactly
```

---

### **3. DATA REALITY GUARDRAIL**

#### **AVAILABLE DATA (USE THIS):**

```tsx
✅ cma.stats.count          → Total Properties Analyzed
✅ cma.stats.avg            → Average List Price
✅ cma.stats.median         → Median List Price
✅ cma.stats.min, max       → Price Range
✅ Calculate from properties → Price per Sq M (avg of price/sqm)
```

#### **UNAVAILABLE DATA (MOCK WITH LABEL):**

```tsx
⚠️ Average Sold Price       → Mock: avg * 0.98, MUST show "Mock data placeholder"
⚠️ Median Sold Price        → Mock: median * 0.99, MUST show "Mock data placeholder"
⚠️ Average Days on Market   → Mock: 42, MUST show "Mock data placeholder"
```

#### **MOCK DATA REQUIREMENTS:**

- Use `text-xs text-red-500` for mock label (matches MetricCard pattern)
- Place label at bottom of table with asterisk references
- Use reasonable approximations (sold ≈ 98% of list price)
- Never claim mock data is real

#### **CALCULATION SAFETY:**

```tsx
// Price per Sq M calculation
const validProperties = properties.filter(p =>
  p.price > 0 && p.sqm > 0
);
const pricePerSqm = validProperties.length > 0
  ? validProperties.reduce((sum, p) => sum + (p.price / p.sqm), 0) / validProperties.length
  : 0;
```

---

### **4. COMPONENT STRUCTURE GUARDRAIL**

#### **REQUIRED STRUCTURE:**

```tsx
interface CMASummaryTableProps {
  open: boolean;
  onClose: () => void;
  cma: {
    stats: { count: number; avg: number; median: number; min: number; max: number };
    properties?: Array<{ price: number; sqm: number; [key: string]: unknown }>;
  } | null;
}

export const CMASummaryTable: React.FC<CMASummaryTableProps> = ({ open, onClose, cma }) => {
  // Modal refs and state (copy from DataTable)
  // ESC key handler (copy from DataTable)
  // Focus trap (copy from DataTable)
  // Backdrop click handler (copy from DataTable)

  if (!open) return null;

  // Calculate metrics
  // Render modal with table
}
```

#### **TABLE STRUCTURE:**

```
┌─────────────────────────────────────┐
│  CMA Summary               [Close]  │
├─────────────────────────────────────┤
│  Metric                  │  Value   │
│ ─────────────────────────┼──────────│
│  Row 1                   │  Value   │
│  Row 2                   │  Value   │
│  ...                                │
│                                     │
│  *Mock data placeholder             │
│                                     │
│  Purpose:                           │
│  • Bullet point 1                   │
│  • Bullet point 2                   │
└─────────────────────────────────────┘
```

---

### **5. WIRING PATTERN GUARDRAIL**

#### **CMASummary.tsx MODIFICATION:**

```tsx
// Line ~5: Add to interface
interface CMASummaryProps {
  cma?: { stats: {...} };
  onOpenCMASummary?: () => void;  // ADD THIS
}

// Line ~23: Modify View button
<Button
  onClick={(e) => {
    e.stopPropagation();           // CRITICAL: Prevents backdrop close
    onOpenCMASummary?.();
  }}
  variant="ghost"
  size="sm"
  className="h-8 gap-2 text-gray-600 hover:text-gray-900"
>
  <Eye className="h-4 w-4" />
  View
</Button>
```

#### **App.tsx MODIFICATION:**

```tsx
// Line ~12: Add import
import { CMASummaryTable } from './components/dashboard/CMASummaryTable';

// Line ~54: Add state (after isDataTableOpen)
const [isCMASummaryOpen, setIsCMASummaryOpen] = useState(false);

// Line ~398: Add handler to CMASummary
<CMASummary
  cma={cma}
  onOpenCMASummary={() => setIsCMASummaryOpen(true)}
/>

// Line ~442: Render modal (after DataTable)
<CMASummaryTable
  open={isCMASummaryOpen}
  onClose={() => setIsCMASummaryOpen(false)}
  cma={cma}
/>
```

---

### **6. DESIGN SYSTEM COMPLIANCE**

#### **REQUIRED STYLING:**

```tsx
// Modal backdrop
className="fixed inset-0 z-50 flex items-center justify-center"

// Backdrop overlay
className="absolute inset-0 bg-black/30 transition-opacity duration-250"

// Card
className="relative z-10 bg-white border border-gray-200 rounded-3xl shadow-sm w-[95vw] max-w-3xl max-h-[85vh] overflow-hidden"

// Header
className="flex items-center justify-between p-4 border-b border-gray-200"

// Title
className="text-lg font-semibold text-gray-900"

// Table header
className="text-xs text-gray-600"

// Table rows
className="border-t border-gray-100 text-sm text-gray-900"

// Mock data label
className="text-xs text-red-500 mt-4"
```

#### **PROHIBITED STYLING:**

```
❌ No custom colors beyond existing palette
❌ No new border-radius values
❌ No custom shadows
❌ No inline styles (unless for dynamic values)
❌ No !important flags
❌ No z-index beyond z-50
```

---

### **7. SECURITY GUARDRAIL**

#### **REQUIRED:**

- All numeric values use `.toLocaleString()` for formatting
- No raw HTML rendering (plain text only)
- No `dangerouslySetInnerHTML`
- No dynamic code execution
- Safe fallbacks for undefined values

#### **SANITIZATION PATTERN:**

```tsx
const formatCurrency = (value: number | undefined): string => {
  if (value === undefined || !Number.isFinite(value)) return 'N/A';
  return `₱${Math.round(value).toLocaleString()}`;
};
```

---

### **8. ACCESSIBILITY GUARDRAIL**

#### **REQUIRED ATTRIBUTES:**

```tsx
<div
  aria-modal="true"
  role="dialog"
  className="fixed inset-0..."
>
```

#### **KEYBOARD HANDLING:**

- ESC key closes modal
- Tab key cycles through focusable elements (focus trap)
- Close button receives initial focus
- Backdrop click closes modal

---

### **9. TESTING CHECKLIST**

#### **FUNCTIONAL TESTS:**

- [ ] Click "View" button opens modal
- [ ] ESC key closes modal
- [ ] Backdrop click closes modal
- [ ] Close button closes modal
- [ ] Real data displays correctly
- [ ] Mock data has red label
- [ ] Price formatting correct (₱ symbol, commas)
- [ ] Modal centers on screen
- [ ] Scrolls if content too tall

#### **REGRESSION TESTS:**

- [ ] CMASummary card still displays summary
- [ ] Download button still works
- [ ] Other dashboard cards unchanged
- [ ] API calls unchanged
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No visual layout shifts

---

### **10. TIME BUDGET GUARDRAIL**

#### **IMPLEMENTATION PHASES:**

```
Phase 1 (10 min): Create CMASummaryTable.tsx (copy DataTable structure)
Phase 2 (5 min):  Wire CMASummary.tsx View button
Phase 3 (5 min):  Wire App.tsx state + render
Phase 4 (10 min): Test all interactions + verify styling

HARD STOP: 30 minutes
```

#### **IF BLOCKED AT 20 MINUTES:**

- Stop and reassess
- Ask: "Am I over-engineering?"
- Consider: Ship with fewer metrics if needed
- Remember: This is a modal table, not a data visualization platform

---

### **11. DONE CRITERIA**

#### **MINIMUM VIABLE:**

- ✅ View button opens modal
- ✅ Modal displays 7 metrics in table format
- ✅ Real data for 5 metrics, mock for 2
- ✅ Mock data labeled with red text
- ✅ ESC/backdrop/close all work
- ✅ No visual regressions
- ✅ No console errors

#### **SHIP WHEN:**

- All 7 items above are ✅
- Implementation took ≤30 minutes
- No new dependencies added
- Code mirrors DataTable.tsx structure

---

### **12. ANTI-PATTERNS TO AVOID**

```
❌ "Let me add sorting/filtering"
❌ "Let me use a better table library"
❌ "Let me add charts to this modal"
❌ "Let me improve the DataTable pattern"
❌ "Let me add export functionality"
❌ "Let me create a shared modal component"
❌ "Let me add unit tests"
❌ "Let me add loading states"
❌ "Let me make it responsive"
❌ "Let me add animations"

✅ Copy DataTable.tsx
✅ Change table content
✅ Ship it
```

---

### **13. GUARDRAIL VIOLATION RECOVERY**

#### **IF YOU ADDED A DEPENDENCY:**

```bash
git reset --hard HEAD
npm install
Start over following guardrails
```

#### **IF YOU MODIFIED EXISTING COMPONENTS:**

```bash
git diff [component].tsx
Verify only allowed changes (prop + handler)
Revert any unrelated modifications
```

#### **IF IMPLEMENTATION > 30 MINUTES:**

- Stop immediately
- Ship what's working
- Document incomplete parts
- Don't perfect it

---

### **SUMMARY: ONE-SENTENCE GUARDRAIL**

**"Copy DataTable.tsx modal structure exactly, replace table contents with 7 CMA metrics (5 real + 2 labeled mocks), wire View button, ship in 30 minutes—this is a replication task, not an architecture project."**

---

**These guardrails ensure the CMA Summary Table delivers exactly what's needed with zero bloat, maximum pattern reuse, and flawless integration into the existing Kairos system.**

---

## **SCRAPER OPTIMIZATION IMPLEMENTATION GUARDRAILS**

**Purpose:** Optimize scraper performance for 100+ properties in under 25 seconds while maintaining system reliability  
**Context:** Render deployment timeout issues requiring conservative optimization approach  
**Target:** Reduce timeout crashes from 100% to <5% while increasing property count from ~50 to 80-100

---

### **1. IMPLEMENTATION CONSTRAINT LAYER**

**What it means:** *Tells Cursor that scraper optimization uses existing patterns only, no new architecture.*

```
SCRAPER_OPTIMIZATION_INTEGRATION_CONTEXT:
"Optimizing Kairos scraper for Render deployment with existing patterns:
- Use existing environment variables (SCRAPER_MAX_PAGES, SCRAPER_MAX_COUNT, SCRAPER_TIMEOUT_SEC)
- Extend existing CSV diagnostics with minimal additional fields
- Add simple timeout checks using existing time module
- Maintain all existing fallback strategies and error handling
- Conservative settings first, optimize based on real user data
- Direct implementation: Configuration changes + simple validation, no complex systems"
```

---

### **2. PERFORMANCE REQUIREMENTS CONTEXT**

**What it means:** *Ensures optimization targets are realistic and measurable.*

```
SCRAPER_PERFORMANCE_TARGETS:
"Scraper optimization must achieve specific performance goals:
- Execution time: 15-25 seconds (vs 30+ seconds before)
- Property count: 60-120 properties (vs ~50 before)  
- Success rate: 95%+ (vs current timeout failures)
- Early exit frequency: <20% of requests
- Render timeout crashes: <5% (vs 100% currently)
- Conservative initial settings that can be safely increased later"
```

---

### **3. TECHNICAL BLoat Prevention CONTEXT**

**What it means:** *Prevents over-engineering and maintains system simplicity.*

```
SCRAPER_OPTIMIZATION_ANTI_BLOAT:
"Scraper optimization must avoid technical complexity:
- No new Python libraries or dependencies
- No threading, async, or parallel processing
- No caching systems or persistent storage
- No database connections or external services
- No complex monitoring dashboards or alerting
- No machine learning or AI-based optimization
- Maximum 20 lines of code changes total
- Use existing time, os, and requests modules only"
```

---

### **4. CONFIGURATION MANAGEMENT CONTEXT**

**What it means:** *Ensures safe, reversible configuration changes.*

```
SCRAPER_CONFIGURATION_SAFETY:
"Scraper configuration changes must be conservative and reversible:
- SCRAPER_MAX_PAGES: Start with 3 (was 10), can increase to 4-5 later
- SCRAPER_MAX_COUNT: Start with 120 (was 100), can increase to 150 later
- SCRAPER_TIMEOUT_SEC: Set to 25 (was 600), prevents Render timeout
- Request timeout: Reduce to 7s (was 15s), faster page loads
- All changes via environment variables in render.yaml
- Keep original values documented for rollback
- Test rollback procedure before deploying"
```

---

### **5. VALIDATION AND MONITORING CONTEXT**

**What it means:** *Provides safety nets without complex monitoring systems.*

```
SCRAPER_VALIDATION_SAFETY_NETS:
"Scraper optimization requires simple validation and monitoring:
- Add minimum property validation (fail if <40 properties)
- Extend existing CSV diagnostics with 3 fields: property_count, execution_time, early_exit_triggered
- Use existing print() statements for logging (no new logging libraries)
- Check CSV files manually for first week (no automated alerts)
- If early exit >30%, increase timeout by 5 seconds
- If property count consistently <60, increase MAX_PAGES by 1
- Focus on user-reported issues over perfect metrics"
```

---

### **6. ERROR HANDLING AND GRACEFUL DEGRADATION**

**What it means:** *Ensures system remains functional even with optimization failures.*

```
SCRAPER_OPTIMIZATION_ERROR_HANDLING:
"Scraper optimization must maintain system reliability:
- If timeout triggers, return whatever data was collected (don't fail completely)
- If property count is low, log warning but still return results
- If early exit happens frequently, automatically adjust settings
- Always maintain backward compatibility with existing API contracts
- Never break existing address search functionality
- Never modify core scraping logic beyond timeout and validation
- Graceful degradation: Better to have fewer properties than no properties"
```

---

### **7. IMPLEMENTATION PHASES AND TIME BUDGETS**

**What it means:** *Ensures implementation stays focused and doesn't over-engineer.*

```
SCRAPER_OPTIMIZATION_IMPLEMENTATION_PHASES:
"Scraper optimization implementation phases with strict time limits:

Phase 1 (15 min): Update render.yaml configuration
- SCRAPER_MAX_PAGES: 10 → 3
- SCRAPER_MAX_COUNT: 100 → 120  
- SCRAPER_TIMEOUT_SEC: 600 → 25

Phase 2 (20 min): Add early exit logic to scraper.py
- Add start_time = time.time() before main loop
- Add timeout check: if time.time() - start_time > SCRAPER_TIMEOUT_SEC: break

Phase 3 (15 min): Add request timeout optimization
- Change session.get(timeout=15) to session.get(timeout=7)

Phase 4 (10 min): Add minimum property validation
- Add: if len(data) < 40: print("WARNING: Low property count")

Phase 5 (15 min): Extend CSV diagnostics
- Add: property_count, execution_time, early_exit_triggered fields

HARD STOP: 75 minutes total
```

---

### **8. TESTING AND VALIDATION REQUIREMENTS**

**What it means:** *Ensures optimization works before deployment.*

```
SCRAPER_OPTIMIZATION_TESTING:
"Scraper optimization must be tested before deployment:
- Test with Metro Manila data (most common use case)
- Verify execution stays under 25 seconds
- Confirm property count is 60-120 range
- Ensure no breaking changes to existing functionality
- Test rollback procedure (revert environment variables)
- Validate CSV diagnostics output format
- Check that early exit logic triggers appropriately"
```

---

### **9. SUCCESS METRICS AND MONITORING**

**What it means:** *Provides clear success criteria and monitoring approach.*

```
SCRAPER_OPTIMIZATION_SUCCESS_METRICS:
"Scraper optimization success is measured by:

PRIMARY GOALS:
- Reduce Render timeout crashes from 100% to <5%
- Increase average property count from ~50 to 80-100
- Maintain execution time under 25 seconds for 95% of requests
- Achieve consistent user experience (predictable report sizes)

MONITORING INDICATORS:
- Early exit frequency (should be <20% of requests)
- Average property count per report (target: 80-100)
- Execution time distribution (target: 15-25 seconds)
- User satisfaction with report completeness

ADJUSTMENT TRIGGERS:
- If early exit >30%: Increase timeout by 5 seconds
- If property count <60: Increase MAX_PAGES by 1
- If execution time >25s: Reduce MAX_PAGES by 1
- If user complaints about missing data: Increase timeout"
```

---

### **10. ANTI-PATTERNS AND COMMON MISTAKES**

**What it means:** *Prevents over-engineering and scope creep.*

```
SCRAPER_OPTIMIZATION_ANTI_PATTERNS:
"Scraper optimization must avoid these common mistakes:

❌ 'Let me add parallel processing for faster scraping'
❌ 'Let me implement caching to avoid re-scraping'
❌ 'Let me add retry logic for failed requests'
❌ 'Let me create a monitoring dashboard'
❌ 'Let me add machine learning for smart sampling'
❌ 'Let me implement circuit breakers'
❌ 'Let me add complex error recovery'
❌ 'Let me create a separate optimization service'
❌ 'Let me add database logging for analytics'
❌ 'Let me implement A/B testing for different settings'

✅ Adjust environment variables in render.yaml
✅ Add simple timeout check in scraper loop
✅ Extend existing CSV diagnostics
✅ Add minimum property validation
✅ Ship with conservative settings
✅ Adjust based on real user data
```

---

### **11. ROLLBACK AND RECOVERY PROCEDURES**

**What it means:** *Ensures optimization can be safely reverted if issues arise.*

```
SCRAPER_OPTIMIZATION_ROLLBACK:
"Scraper optimization must support safe rollback:

IF TIMEOUT ISSUES PERSIST:
- Revert SCRAPER_TIMEOUT_SEC to 600
- Revert SCRAPER_MAX_PAGES to 10
- Revert SCRAPER_MAX_COUNT to 100
- Remove early exit logic from scraper.py
- Deploy rollback version immediately

IF PROPERTY COUNTS TOO LOW:
- Increase SCRAPER_MAX_PAGES to 4 or 5
- Increase request timeout to 10 seconds
- Remove minimum property validation
- Monitor for Render timeout issues

IF USER COMPLAINTS ABOUT SPEED:
- Reduce SCRAPER_MAX_PAGES to 2
- Reduce request timeout to 5 seconds
- Accept lower property counts for faster execution

RECOVERY PROCEDURES:
- All changes are environment variable based
- No code changes required for rollback
- Test rollback procedure before deploying optimization
- Keep original configuration values documented"
```

---

### **12. DONE CRITERIA AND SHIP CONDITIONS**

**What it means:** *Provides clear completion criteria.*

```
SCRAPER_OPTIMIZATION_DONE_CRITERIA:
"Scraper optimization is complete when:

MINIMUM VIABLE:
- ✅ render.yaml updated with conservative settings
- ✅ Early exit logic added to scraper.py (max 5 lines)
- ✅ Request timeout reduced to 7 seconds
- ✅ Minimum property validation added (max 3 lines)
- ✅ CSV diagnostics extended with 3 new fields
- ✅ No new dependencies or libraries added
- ✅ All existing functionality preserved
- ✅ Implementation completed in ≤75 minutes

SHIP WHEN:
- All 8 items above are ✅
- Test with Metro Manila data passes
- Execution time consistently <25 seconds
- Property count consistently 60-120
- No breaking changes to existing API
- Rollback procedure tested and documented

MONITORING PHASE:
- Check CSV diagnostics daily for first week
- Adjust settings based on real user data
- Respond to user feedback within 24 hours
- Document all configuration changes"
```

---

### **13. ONE-SENTENCE GUARDRAIL**

**"Adjust environment variables to conservative settings, add 25-second early exit check, reduce request timeouts to 7 seconds, extend CSV diagnostics with 3 fields, ship in 75 minutes—this is configuration optimization, not system architecture."**

---

**These guardrails ensure scraper optimization delivers reliable performance improvements with zero technical bloat, maximum system stability, and flawless integration into the existing Kairos architecture.**

---

**These guardrails ensure the PSGC implementation follows established patterns, maintains security and performance, and provides a solid foundation for future expansion while keeping the codebase lean and maintainable.**
