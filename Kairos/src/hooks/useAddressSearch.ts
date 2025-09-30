/**
 * Custom Hook: useAddressSearch
 * 
 * Philippine address autocomplete with debounced search and caching.
 * 
 * ARCHITECTURE: This hook is THE SWAP POINT for API integration
 * - TODAY: Uses mock Philippine address data
 * - LATER: Replace mockSearchAddresses() with real API call to /api/addresses/search
 * - Component code never needs to change
 * 
 * API Integration Pattern:
 * 1. User types → Hook debounces (300ms)
 * 2. Mock search executes (will be: API call)
 * 3. Returns structured suggestions
 * 4. Results cached in localStorage
 */

import { useState, useEffect, useRef } from 'react';
import type { 
  AddressSearchResponse, 
  AddressSuggestion,
  AddressSearchError 
} from '@/types/address';

// ============================================================================
// MOCK DATA - Remove this section when backend API is ready
// ============================================================================

/**
 * Mock Philippine addresses with proper PSGC codes and coordinates
 * This data structure matches the exact API response format
 */
const MOCK_PHILIPPINE_ADDRESSES: AddressSuggestion[] = [
  {
    full_address: "Bonifacio Global City (BGC), Taguig City, Metro Manila",
    psgc_city_code: "137602000",
    psgc_province_code: "1376",
    coordinates: [14.5547, 121.0477],
    search_radius_km: 5,
    confidence_level: "high"
  },
  {
    full_address: "Makati Central Business District, Makati City, Metro Manila",
    psgc_city_code: "137501000",
    psgc_province_code: "1375",
    coordinates: [14.5547, 121.0244],
    search_radius_km: 5,
    confidence_level: "high"
  },
  {
    full_address: "Ortigas Center, Pasig City, Metro Manila",
    psgc_city_code: "137403000",
    psgc_province_code: "1374",
    coordinates: [14.5846, 121.0569],
    search_radius_km: 5,
    confidence_level: "high"
  },
  {
    full_address: "Alabang, Muntinlupa City, Metro Manila",
    psgc_city_code: "137803000",
    psgc_province_code: "1378",
    coordinates: [14.4292, 121.0419],
    search_radius_km: 7,
    confidence_level: "high"
  },
  {
    full_address: "Quezon City, Metro Manila",
    psgc_city_code: "137404000",
    psgc_province_code: "1374",
    coordinates: [14.6760, 121.0437],
    search_radius_km: 10,
    confidence_level: "medium"
  },
  {
    full_address: "Eastwood City, Quezon City, Metro Manila",
    psgc_city_code: "137404000",
    psgc_province_code: "1374",
    coordinates: [14.6091, 121.0794],
    search_radius_km: 5,
    confidence_level: "high"
  },
  {
    full_address: "Rockwell Center, Makati City, Metro Manila",
    psgc_city_code: "137501000",
    psgc_province_code: "1375",
    coordinates: [14.5656, 121.0360],
    search_radius_km: 3,
    confidence_level: "high"
  },
  {
    full_address: "Manila, Metro Manila",
    psgc_city_code: "137600000",
    psgc_province_code: "1376",
    coordinates: [14.5995, 120.9842],
    search_radius_km: 15,
    confidence_level: "medium"
  },
  {
    full_address: "Aseana City, Parañaque City, Metro Manila",
    psgc_city_code: "137405000",
    psgc_province_code: "1374",
    coordinates: [14.5378, 120.9896],
    search_radius_km: 5,
    confidence_level: "high"
  },
  {
    full_address: "Greenfield District, Mandaluyong City, Metro Manila",
    psgc_city_code: "137502000",
    psgc_province_code: "1375",
    coordinates: [14.5833, 121.0500],
    search_radius_km: 4,
    confidence_level: "high"
  }
];

/**
 * Mock search function - simulates backend ph-address API
 * 
 * SWAP POINT: Replace this entire function with:
 * ```typescript
 * const response = await fetch(`/api/addresses/search?q=${encodeURIComponent(query)}&limit=5`);
 * if (!response.ok) throw new Error('API request failed');
 * return await response.json();
 * ```
 */
async function mockSearchAddresses(query: string): Promise<AddressSearchResponse> {
  const startTime = Date.now();
  
  // Simulate network latency (50-100ms) to mimic real API behavior
  const delay = Math.random() * 50 + 50;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Case-insensitive search across all address fields
  const lowerQuery = query.toLowerCase().trim();
  const filteredSuggestions = MOCK_PHILIPPINE_ADDRESSES.filter(address =>
    address.full_address.toLowerCase().includes(lowerQuery)
  );
  
  // Limit to top 5 matches (API will do this)
  const suggestions = filteredSuggestions.slice(0, 5);
  
  return {
    suggestions,
    total: suggestions.length,
    query_time_ms: Date.now() - startTime
  };
}

// ============================================================================
// END MOCK DATA SECTION
// ============================================================================

// ============================================================================
// LOCALSTORAGE CACHING
// ============================================================================

interface CachedSearchResult {
  data: AddressSearchResponse;
  timestamp: number;
}

const CACHE_KEY_PREFIX = 'kairos_address_search_';
const CACHE_EXPIRY_MS = 1000 * 60 * 60; // 1 hour

/**
 * Get cached search results if available and not expired
 */
function getCachedResult(query: string): AddressSearchResponse | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + query);
    if (!cached) return null;
    
    const { data, timestamp }: CachedSearchResult = JSON.parse(cached);
    const age = Date.now() - timestamp;
    
    if (age > CACHE_EXPIRY_MS) {
      localStorage.removeItem(CACHE_KEY_PREFIX + query);
      return null;
    }
    
    return data;
  } catch {
    // Cache read error - fail silently and return null
    return null;
  }
}

/**
 * Cache search results in localStorage
 */
function setCachedResult(query: string, data: AddressSearchResponse): void {
  try {
    const cached: CachedSearchResult = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY_PREFIX + query, JSON.stringify(cached));
  } catch {
    // Cache write error - non-critical, continue without caching
  }
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

interface UseAddressSearchReturn {
  suggestions: AddressSuggestion[];
  isLoading: boolean;
  error: AddressSearchError | null;
  clearError: () => void;
}

/**
 * Custom hook for Philippine address autocomplete with debouncing and caching
 * 
 * @param query - Search query string
 * @param debounceMs - Debounce delay in milliseconds (default: 300ms)
 * @returns Search results, loading state, and error handling
 * 
 * @example
 * ```tsx
 * const { suggestions, isLoading, error } = useAddressSearch(searchQuery);
 * ```
 */
export function useAddressSearch(
  query: string,
  debounceMs: number = 300
): UseAddressSearchReturn {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AddressSearchError | null>(null);
  
  // Track the latest query to prevent race conditions
  const latestQueryRef = useRef<string>('');
  
  useEffect(() => {
    // Clear suggestions if query is too short
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    
    // Set loading state immediately for UX feedback
    setIsLoading(true);
    setError(null);
    
    // Debounce: Wait 300ms before searching
    const debounceTimer = setTimeout(async () => {
      latestQueryRef.current = query;
      
      try {
        // Check cache first
        const cached = getCachedResult(query);
        if (cached) {
          setSuggestions(cached.suggestions);
          setIsLoading(false);
          return;
        }
        
        // SWAP POINT: Replace mockSearchAddresses with real API call
        const response = await mockSearchAddresses(query);
        
        // Only update if this is still the latest query
        if (latestQueryRef.current === query) {
          setSuggestions(response.suggestions);
          setCachedResult(query, response);
          setIsLoading(false);
        }
      } catch {
        // Only update error if this is still the latest query
        if (latestQueryRef.current === query) {
          setError({
            message: 'Unable to search addresses. Please try again.',
            code: 'API_ERROR',
            retryable: true
          });
          setSuggestions([]);
          setIsLoading(false);
        }
      }
    }, debounceMs);
    
    // Cleanup: Cancel pending search if query changes
    return () => {
      clearTimeout(debounceTimer);
    };
  }, [query, debounceMs]);
  
  const clearError = () => setError(null);
  
  return {
    suggestions,
    isLoading,
    error,
    clearError
  };
}
