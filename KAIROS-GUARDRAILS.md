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
