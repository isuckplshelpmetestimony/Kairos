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

**These guardrails ensure the PSGC implementation follows established patterns, maintains security and performance, and provides a solid foundation for future expansion while keeping the codebase lean and maintainable.**
