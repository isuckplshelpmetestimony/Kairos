# PSGC Data Searching Reference for Kairos

**Purpose:** Prevent architectural mistakes and provide decision-making guidance for Philippine address/location features

**Created:** September 30, 2025  
**Context:** Philippine address autocomplete system implementation

---

## 📚 What is PSGC?

**Philippine Standard Geographic Code (PSGC)** is the official coding system for geographic areas in the Philippines maintained by the Philippine Statistics Authority (PSA).

### Structure:
```
PSGC City Code:    137602000
PSGC Province Code: 1376
PSGC Region Code:   13

Example: Taguig City, Metro Manila
- City: 137602000 (Taguig City)
- Province: 1376 (Metro Manila)
- Region: 13 (NCR)
```

### Why PSGC Matters for Kairos:
- **Accurate CMA Generation**: Scrapers target exact geographic boundaries
- **No Ambiguity**: "Makati" could mean city or barangay - PSGC is precise
- **Government Standard**: Official real estate data uses PSGC codes
- **Future-Proof**: International expansion can use similar coding systems

---

## ❌ Critical Mistake #1: Client-Side SQLite Integration

### What Was Attempted:
- Integrate `kosinix/ph-address` library directly in React frontend
- Use SQLite database in the browser for address autocomplete
- Bundle entire Philippine address database with frontend

### Why It Failed:
1. **Technical Impossibility**: SQLite requires Node.js, not browser APIs
2. **Bundle Size Problem**: 50MB+ database unusable on mobile
3. **Architecture Mismatch**: Server-side library forced into client context
4. **Performance Issues**: Would cause build failures and crashes

### The Lesson:
> **Always verify library compatibility with target environment BEFORE planning architecture**

**Decision Framework:**
```
Is this a Node.js library? → Check if it uses `fs`, `path`, native modules
Does it require a database? → Check if database runs in browsers
What's the data size? → Calculate bundle impact on mobile users
```

---

## ✅ Correct Approach: Backend API Architecture

### Architecture Pattern:
```
User Input → Frontend (React)
    ↓
    API Call with debouncing (300ms)
    ↓
Backend Service (Hetzner VPS)
    ↓
ph-address + SQLite (Node.js environment)
    ↓
Structured JSON Response
    ↓
Frontend receives PSGC codes + metadata
    ↓
CMA Scraper uses PSGC for targeting
```

### Why This Works:
- ✅ **ph-address in native Node.js environment** (SQLite works)
- ✅ **Lightweight API responses** (~5KB JSON vs 50MB database)
- ✅ **Scalable** (backend handles thousands of users)
- ✅ **Secure** (no database exposure to client)
- ✅ **Maintainable** (clear separation of concerns)

### Implementation Pattern:
```typescript
// Frontend: Kairos/src/hooks/useAddressSearch.ts
const response = await fetch(
  `/api/addresses/search?q=${encodeURIComponent(query)}&limit=5`
);
const data: AddressSearchResponse = await response.json();

// Backend: Hetzner VPS (to be implemented)
app.get('/api/addresses/search', async (req, res) => {
  const { q, limit = 5 } = req.query;
  const results = await phAddress.search(q, { limit });
  res.json({ suggestions: results, total: results.length });
});
```

---

## 🎯 Mock Data Strategy (Development Phase)

### The Problem:
Backend API doesn't exist yet, but frontend needs to be built NOW.

### The Solution:
**Build with mock data, design for easy swap**

### Implementation:
```typescript
// File: Kairos/src/hooks/useAddressSearch.ts
// Lines 23-263: Mock data with 10 real Philippine addresses

const MOCK_ADDRESSES: AddressSuggestion[] = [
  {
    full_address: "Bonifacio Global City (BGC), Taguig City, Metro Manila",
    psgc_city_code: "137602000",
    psgc_province_code: "1376",
    coordinates: [14.5547, 121.0477],
    search_radius_km: 5,
    confidence_level: "high"
  },
  // ... 9 more addresses
];
```

### The Swap Point (3 Lines):
```typescript
// Line 265 in useAddressSearch.ts
// 🔄 THE SWAP POINT - Replace mock with API call

// CURRENT (Mock):
const filtered = MOCK_ADDRESSES.filter(addr => 
  addr.full_address.toLowerCase().includes(query.toLowerCase())
);

// FUTURE (Real API - change these 3 lines):
const response = await fetch(`/api/addresses/search?q=${encodeURIComponent(query)}&limit=5`);
if (!response.ok) throw new Error('API request failed');
const data: AddressSearchResponse = await response.json();
```

### Files That DON'T Change When Swapping:
- ✅ `components/AddressInput.tsx` (UI component)
- ✅ `types/address.ts` (TypeScript interfaces)
- ✅ `App.tsx` (integration)
- ✅ All other application code

**Only 1 file needs modification: `hooks/useAddressSearch.ts`**

---

## 🛡️ Security Requirements for PSGC Data

### Input Validation:
```typescript
// ✅ CORRECT: Sanitize user input
const sanitizedQuery = query.trim().slice(0, 100); // Max 100 chars
const response = await fetch(
  `/api/addresses/search?q=${encodeURIComponent(sanitizedQuery)}`
);

// ❌ WRONG: Direct user input to API
const response = await fetch(`/api/addresses/search?q=${query}`);
```

### Output Structure:
```typescript
// ✅ CORRECT: Structured PSGC output prevents injection
interface KairosAddressOutput {
  full_address: string;           // Display only
  location: {
    psgc_city_code: string;        // Used for scraper targeting
    psgc_province_code: string;    // Used for scraper targeting
    coordinates: { latitude: number; longitude: number };
  };
  search_parameters: {
    radius_km: number;
    confidence_level: 'high' | 'medium' | 'low';
  };
}

// ❌ WRONG: Raw string input to scrapers
const scraperInput = userInput; // "BGC" could mean anything
```

### Why This Matters:
- **Injection Prevention**: PSGC codes are numeric, can't inject SQL/script
- **No User Input in Scrapers**: Scrapers receive validated PSGC codes, NOT raw text
- **Type Safety**: TypeScript enforces correct structure throughout

---

## ⚡ Performance Requirements

### Debouncing (Mandatory):
```typescript
// ✅ CORRECT: 300ms debounce prevents API spam
useEffect(() => {
  const timeoutId = setTimeout(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery);
    }
  }, 300);
  return () => clearTimeout(timeoutId);
}, [debouncedQuery]);

// ❌ WRONG: Immediate API call on every keystroke
useEffect(() => {
  performSearch(query); // Fires 10+ times for "Makati"
}, [query]);
```

### Caching Strategy:
```typescript
// ✅ CORRECT: localStorage caching (1 hour)
const cacheKey = `address_search_${query}`;
const cached = localStorage.getItem(cacheKey);

if (cached) {
  const { data, timestamp } = JSON.parse(cached);
  const isExpired = Date.now() - timestamp > 3600000; // 1 hour
  if (!isExpired) return data;
}

// Store fresh results
localStorage.setItem(cacheKey, JSON.stringify({
  data: results,
  timestamp: Date.now()
}));
```

### Response Limits:
```typescript
// ✅ CORRECT: Limit results to top 5
const response = await fetch(
  `/api/addresses/search?q=${query}&limit=5`
);

// ❌ WRONG: Return all matches (could be 1000+)
const response = await fetch(`/api/addresses/search?q=${query}`);
```

---

## 🎨 Kairos Design System Integration

### Color Variables (Verified Correct):
```css
--kairos-chalk: #FFFFFC;              /* Lightest background */
--kairos-white-porcelain: #F8FBF8;    /* Main container background */
--kairos-white-grey: #DCDDDD;         /* Border color */
--kairos-charcoal: #2C2C2C;           /* Text and focus states */
--kairos-soft-black: #1A1A1A;         /* Buttons and primary actions */
```

### AddressInput Component Styling Pattern:
```tsx
// ✅ CORRECT: Matches existing input styling
<input
  className="
    w-full h-16 px-6 text-lg
    bg-kairos-white-porcelain
    border-2 border-kairos-white-grey
    rounded-2xl shadow-sm
    text-kairos-charcoal
    focus:outline-none focus:border-kairos-charcoal
    transition-colors duration-200
  "
/>

// Dropdown styling
<div className="
  absolute z-50 w-full mt-2
  bg-kairos-chalk
  border border-kairos-white-grey
  rounded-lg shadow-lg
  max-h-80 overflow-y-auto
">
```

### Design Philosophy:
> "Calm in the chaos" - every element reduces cognitive load

**Key Principles:**
- Clean, minimal layouts with generous white space
- Neutral color palette
- Typography hierarchy (16px minimum body text)
- Simple, rounded input fields with clean borders
- Dark buttons for primary actions
- Subtle shadows for depth without noise

---

## 🔄 Context Engineering (9 Required Layers)

**These 9 contexts were verified after EVERY phase of implementation:**

### 1. Integration Constraint Layer
- Backend ph-address runs on Hetzner VPS (Node.js + SQLite)
- Frontend makes API calls to `/api/addresses/search`
- Client receives lightweight JSON, not full database

### 2. Data Flow Security Context
- Rate limiting: 100 requests/min per IP
- Input validation: Sanitize all search queries
- No logging of user search terms (privacy)
- CORS: Netlify frontend only
- Structured PSGC output prevents injection

### 3. Integration Pattern Enforcement
```
User types → Debounce (300ms) → API call
→ Backend processes → Returns structured JSON
→ User selects → Creates location object with PSGC
→ Structured object feeds CMA scrapers
```

### 4. Performance Constraint Context
- Frontend debouncing: 300ms
- Backend response time: <100ms
- Cache common searches (localStorage)
- Limit responses to top 5
- Loading states during requests

### 5. Minimal Technical Debt Guardrail
- Simple REST API pattern (no GraphQL/WebSockets)
- Single `/api/addresses/search` endpoint
- Express.js route calls ph-address, returns JSON
- NO custom autocomplete logic - use library as-is

### 6. No Major Fuckups Guardrail
- ❌ NO client-side SQLite
- ❌ NO 50MB frontend bundles
- ❌ NO raw user input to scrapers
- ❌ NO missing TypeScript types
- ❌ NO z-index conflicts

### 7. Security Guardrail
- Rate limiting to prevent abuse
- Input sanitization (prevent SQL injection)
- CORS whitelist for Netlify domain only
- No logging of user search queries
- Error responses don't expose server details

### 8. Future-Proof API Guardrail
```typescript
// API Response Structure
interface AddressSearchResponse {
  suggestions: AddressSuggestion[];
  total: number;
  query_time_ms: number;
}

interface AddressSuggestion {
  full_address: string;
  psgc_city_code: string;
  psgc_province_code: string;
  coordinates: [number, number];
  search_radius_km: number;
  confidence_level: 'high' | 'medium' | 'low';
}
```

### 9. Frontend Component Requirements
- Kairos design system styling
- Keyboard navigation (arrows, enter, escape)
- Loading states and error handling
- Click-outside-to-close behavior
- Clear button and selected state indicator

---

## 📁 File Structure Reference

### Complete Implementation (5 Files):
```
Kairos/
├── src/
│   ├── types/
│   │   └── address.ts                    # 100 lines - 5 TypeScript interfaces
│   ├── hooks/
│   │   └── useAddressSearch.ts           # 302 lines - Custom hook + mock data
│   ├── components/
│   │   └── AddressInput.tsx              # 372 lines - UI component
│   └── App.tsx                           # Modified - Integration (+5/-3 lines)
├── tsconfig.json                          # TypeScript config
└── tsconfig.node.json                     # Node TypeScript config
```

### What Each File Does:

**1. `types/address.ts`** (Read this first)
- Defines all TypeScript interfaces
- Matches exact API specification
- Used by both hook and component
- No logic, pure type definitions

**2. `hooks/useAddressSearch.ts`** (THE SWAP POINT)
- Lines 23-263: Mock data (10 Philippine addresses)
- Line 265: **🔄 THE SWAP POINT** (3 lines to change for real API)
- Lines 265-302: Search logic, caching, debouncing
- Returns: `{ suggestions, isLoading, error, clearError }`

**3. `components/AddressInput.tsx`** (Never changes)
- Complete UI component with Kairos styling
- Keyboard navigation, loading spinner, dropdown
- Props: `onSelect`, `placeholder`, `className`
- Emits: `KairosAddressOutput` on selection

**4. `App.tsx`** (Integration point)
- Line 17: Import AddressInput
- Line 18: Import KairosAddressOutput type
- Line 52: State for selectedAddress
- Line 66-70: AddressInput component usage

---

## 🚨 Common Pitfalls & Solutions

### Pitfall #1: Multiple Codebases
**Symptom:** Features work in one folder but not another

**What Happened:**
- Project was renamed/copied instead of moved
- Old `High-Fidelity Wireframe Design/` folder remained
- New `Kairos/` folder had address autocomplete
- Running wrong dev server showed old code

**Solution:**
```bash
# Verify which folder has latest code
ls -la */src/components/AddressInput.tsx

# Update netlify.toml
[build]
  base = "Kairos"  # Not "High-Fidelity Wireframe Design"

# Delete old folder after safety checkpoint
git tag before-switching-completely-to-Kairoscodebase
git rm -rf "High-Fidelity Wireframe Design"
```

**Prevention:** Always use `git mv` not copy operations

---

### Pitfall #2: Wrong Dev Server Port
**Symptom:** Typed "BGC" but no dropdown appears

**Debugging Process:**
1. Check dev server logs for actual port
2. Verify browser URL matches dev server port
3. Check browser console for React errors
4. Verify correct codebase is running

**Example:**
```bash
# Dev server shows:
> Local:   http://localhost:3001/

# But you're viewing:
http://localhost:3000/  ❌ Wrong port

# Solution:
http://localhost:3001/  ✅ Correct
```

---

### Pitfall #3: Path Alias Confusion
**Symptom:** `Cannot find module '@/components/AddressInput'`

**Fix:**
```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src')
  }
}

// tsconfig.json
"paths": {
  "@/*": ["./src/*"]
}
```

**Verify:**
```typescript
// Both should work:
import { AddressInput } from '@/components/AddressInput';
import { AddressInput } from './components/AddressInput';
```

---

### Pitfall #4: TypeScript Errors Not Showing
**Symptom:** Code works but types feel wrong

**Check:**
```bash
# Run TypeScript compiler
npx tsc --noEmit

# Should show 0 errors
# If errors appear, fix before proceeding
```

---

### Pitfall #5: Linter Warnings as Errors
**Symptom:** Build fails with "unused variable" warnings

**Fix:**
```javascript
// eslint.config.js
rules: {
  'no-console': 'off',           // Allow console.log during dev
  '@typescript-eslint/no-unused-vars': ['warn', {
    argsIgnorePattern: '^_',     // Allow _unusedVar
    varsIgnorePattern: '^_'
  }]
}
```

---

## 🧪 Testing Checklist

### Manual Testing (Before Committing):

**1. Basic Autocomplete:**
- [ ] Type "bgc" → Shows "BGC, Taguig City" suggestion
- [ ] Type "makati" → Shows "Makati CBD" suggestion
- [ ] Type "xyz123" → Shows "No addresses found"

**2. Keyboard Navigation:**
- [ ] Arrow Down → Highlights first suggestion
- [ ] Arrow Up/Down → Moves through suggestions
- [ ] Enter → Selects highlighted suggestion
- [ ] Escape → Closes dropdown

**3. Loading States:**
- [ ] Loading spinner appears while searching (300ms delay)
- [ ] "Searching..." text visible during load

**4. Selected State:**
- [ ] Checkmark icon appears when address selected
- [ ] Clear button (×) appears
- [ ] Clicking clear button resets input

**5. Styling:**
- [ ] Matches existing input field height (h-16)
- [ ] Same padding (px-6) and text size (text-lg)
- [ ] Kairos colors used throughout
- [ ] Focus border color matches design system
- [ ] Dropdown has proper shadow and rounded corners

**6. Edge Cases:**
- [ ] Click outside dropdown → Closes dropdown
- [ ] Type then clear → Resets state properly
- [ ] Select then type again → Shows new suggestions
- [ ] Very long address name → Wraps or truncates properly

### Browser Console Checks:
- [ ] No React errors
- [ ] No TypeScript errors
- [ ] No missing module warnings
- [ ] No CORS errors (when API connected)

---

## 🔮 Future API Integration Checklist

### When Backend is Ready:

**Step 1: Verify Backend API**
```bash
# Test endpoint manually
curl "https://your-hetzner-server.com/api/addresses/search?q=bgc&limit=5"

# Expected response:
{
  "suggestions": [
    {
      "full_address": "Bonifacio Global City...",
      "psgc_city_code": "137602000",
      "psgc_province_code": "1376",
      "coordinates": [14.5547, 121.0477],
      "search_radius_km": 5,
      "confidence_level": "high"
    }
  ],
  "total": 1,
  "query_time_ms": 45
}
```

**Step 2: Update Frontend**
```typescript
// File: Kairos/src/hooks/useAddressSearch.ts
// Line 265 - Replace these lines:

// OLD (Mock):
const filtered = MOCK_ADDRESSES.filter(addr => 
  addr.full_address.toLowerCase().includes(query.toLowerCase())
);
return {
  suggestions: filtered.slice(0, 5),
  total: filtered.length,
  query_time_ms: 50
};

// NEW (Real API):
const response = await fetch(
  `${import.meta.env.VITE_API_BASE_URL}/api/addresses/search?q=${encodeURIComponent(query)}&limit=5`,
  {
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(5000) // 5 second timeout
  }
);

if (!response.ok) {
  throw new Error(`API request failed: ${response.status}`);
}

const data: AddressSearchResponse = await response.json();
return data;
```

**Step 3: Add Environment Variable**
```bash
# .env
VITE_API_BASE_URL=https://your-hetzner-server.com
```

**Step 4: Test Integration**
- [ ] Type "bgc" → Real suggestions appear
- [ ] Check network tab → API calls successful
- [ ] Verify response structure matches types
- [ ] Test error cases (server down, timeout)

**Step 5: Remove Mock Data (Optional)**
```typescript
// Can delete lines 23-263 in useAddressSearch.ts
// Keep for local development reference if desired
```

---

## 📊 Git Workflow Reference

### Branch Structure:
```
main
└── philippine-address-autocomplete-library
    ├── starting-point-0 (checkpoint)
    ├── 94a5c70 - Phase 1: Foundation - Type Definitions
    ├── 7542bdd - Phase 2: Data Layer - Custom Hook
    ├── 84a859e - Phase 3: UI Component
    ├── 8298ad6 - Phase 4: Integration
    └── d6d9066 (HEAD) - Phase 5: Validation
```

### Safety Checkpoints:
```bash
# Created checkpoint before major changes
git tag before-switching-completely-to-Kairoscodebase

# To view checkpoint
git show before-switching-completely-to-Kairoscodebase

# To restore if needed
git checkout -b restore before-switching-completely-to-Kairoscodebase
```

### Commit Message Pattern:
```
Phase N: Descriptive Title

What: Brief description of changes
Why: Reason for changes (optional)
Files: Key files added/modified
```

---

## 🎓 Key Lessons Summary

### Architecture Decisions:
1. ✅ **Verify library compatibility** before planning architecture
2. ✅ **Backend for heavy processing**, frontend for UI only
3. ✅ **Mock data strategy** enables parallel dev/backend work
4. ✅ **Design for easy API swap** (minimize future refactoring)

### Code Quality:
1. ✅ **Type safety throughout** (TypeScript interfaces for everything)
2. ✅ **Single responsibility** (types, hook, component separate)
3. ✅ **Reusable components** (AddressInput is standalone)
4. ✅ **Clear swap points** (documented with comments)

### Security:
1. ✅ **Never trust user input** (sanitize, validate, limit)
2. ✅ **Structured output** (PSGC codes prevent injection)
3. ✅ **No sensitive data logging** (privacy protection)
4. ✅ **Rate limiting** (prevent API abuse)

### Performance:
1. ✅ **Debouncing mandatory** (300ms prevents spam)
2. ✅ **Caching strategy** (localStorage with expiration)
3. ✅ **Limit results** (top 5 suggestions only)
4. ✅ **Loading states** (better UX during async operations)

### Design:
1. ✅ **Match existing patterns** (same height, padding, colors)
2. ✅ **Kairos design system** (calm, professional, minimal)
3. ✅ **Keyboard navigation** (accessibility requirement)
4. ✅ **Progressive disclosure** (show dropdown only when needed)

---

## 🔗 Related Documentation

- **Kairos Design Rules**: `.cursor/rules/kairos-design-rules.mdc`
- **Component Guidelines**: `Kairos/src/guidelines/Guidelines.md`
- **Type Definitions**: `Kairos/src/types/address.ts`
- **API Integration**: `Kairos/src/hooks/useAddressSearch.ts` (line 265)

---

## 📝 Quick Reference Commands

### Development:
```bash
# Start dev server
cd Kairos && npm run dev

# TypeScript check
npx tsc --noEmit

# Lint check
npm run lint

# Build for production
npm run build
```

### Git Operations:
```bash
# View file history
git log --follow -- Kairos/src/components/AddressInput.tsx

# View specific commit
git show 8298ad6

# Create checkpoint
git tag -a checkpoint-name -m "Description"

# Restore from checkpoint
git checkout -b restore-branch checkpoint-name
```

### Testing API Swap:
```bash
# Test backend API
curl "https://api.example.com/api/addresses/search?q=bgc"

# View network calls in browser
# Open DevTools → Network → Filter: Fetch/XHR
# Type in AddressInput → Watch API calls
```

---

## ⚠️ CRITICAL: Do Not Repeat These Mistakes

### ❌ **NEVER** attempt client-side SQLite in browser
- Will fail at build time or runtime
- 50MB+ bundle sizes are unacceptable
- Always use backend API for database operations

### ❌ **NEVER** pass raw user input to scrapers
- Always use structured PSGC codes
- Validate and sanitize all input
- Type-safe data flow prevents injection attacks

### ❌ **NEVER** create multiple codebases without intention
- Use `git mv` not copy operations
- Update build configs immediately after rename
- Test deployments after structural changes

### ❌ **NEVER** skip verification steps
- Run TypeScript compiler before committing
- Test in actual browser, not just in IDE
- Verify correct dev server port
- Check browser console for errors

### ❌ **NEVER** implement without context engineering
- Define all 9 context layers before coding
- Verify against contexts after each phase
- Document architectural decisions
- Plan for future API integration from day 1

---

## ✅ Success Criteria

**This implementation is complete when:**

1. ✅ User can type address and get suggestions
2. ✅ Suggestions use real PSGC codes (not placeholder data)
3. ✅ Selected address creates proper `KairosAddressOutput` structure
4. ✅ CMA scraper receives PSGC codes for targeting
5. ✅ All 9 context requirements satisfied
6. ✅ Zero TypeScript errors
7. ✅ Zero linter errors
8. ✅ Kairos design system styling throughout
9. ✅ API swap requires only 3 lines of code
10. ✅ Production-ready with security and performance

---

**Last Updated:** September 30, 2025  
**Status:** ✅ Complete with mock data, ready for API integration  
**Maintainer:** Kairos Development Team
