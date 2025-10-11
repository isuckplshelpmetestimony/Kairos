/**
 * Custom Hook: useAddressSearch
 * 
 * Philippine address autocomplete with debounced search and caching.
 * 
 * ARCHITECTURE: This hook integrates with the real backend API
 * - Uses /api/addresses/search endpoint for Philippine address data
 * - Includes debouncing, caching, and error handling
 * - Component code never needs to change
 * 
 * API Integration Pattern:
 * 1. User types → Hook debounces (300ms)
 * 2. API call to /api/addresses/search executes
 * 3. Returns structured suggestions with PSGC codes
 * 4. Results cached in localStorage
 */

import { useState, useEffect, useRef } from 'react';
import type { 
  AddressSearchResponse, 
  AddressSuggestion,
  AddressSearchError 
} from '@/types/address';


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
        
        // API call to backend address search endpoint
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const apiResponse = await fetch(`${apiUrl}/api/addresses/search?q=${encodeURIComponent(query)}&limit=5`);
        if (!apiResponse.ok) {
          throw new Error(`API request failed: ${apiResponse.status}`);
        }
        const response = await apiResponse.json();
        
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
