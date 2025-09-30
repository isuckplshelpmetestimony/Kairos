/**
 * Type Definitions for Philippine Address Autocomplete
 * 
 * These interfaces match the exact API structure from the Hetzner backend
 * ph-address service. Designed for easy swap from mock data to real API.
 */

/**
 * Confidence level for address match quality
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Single address suggestion from the search API
 * Matches the structure returned by ph-address backend service
 */
export interface AddressSuggestion {
  /** Complete formatted address string */
  full_address: string;
  
  /** Philippine Standard Geographic Code for the city/municipality */
  psgc_city_code: string;
  
  /** Philippine Standard Geographic Code for the province */
  psgc_province_code: string;
  
  /** Geographic coordinates [latitude, longitude] */
  coordinates: [number, number];
  
  /** Suggested search radius for CMA comparisons in kilometers */
  search_radius_km: number;
  
  /** Confidence level of the address match */
  confidence_level: ConfidenceLevel;
}

/**
 * Complete response from the address search API
 * GET /api/addresses/search?q={query}&limit={number}
 */
export interface AddressSearchResponse {
  /** Array of address suggestions matching the search query */
  suggestions: AddressSuggestion[];
  
  /** Total number of suggestions returned */
  total: number;
  
  /** Backend query execution time in milliseconds */
  query_time_ms: number;
}

/**
 * Structured address output for CMA generation pipeline
 * This is what gets passed to the scraper after user selects an address
 */
export interface KairosAddressOutput {
  /** Complete formatted address for display */
  full_address: string;
  
  /** Geographic location data */
  location: {
    /** City/Municipality PSGC code for scraper targeting */
    psgc_city_code: string;
    
    /** Province PSGC code for scraper targeting */
    psgc_province_code: string;
    
    /** Coordinates for map display and distance calculations */
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  
  /** CMA search parameters */
  search_parameters: {
    /** Radius in kilometers for finding comparable properties */
    radius_km: number;
    
    /** Confidence in address accuracy affects comparison weighting */
    confidence_level: ConfidenceLevel;
  };
  
  /** Timestamp when address was selected */
  selected_at: string;
}

/**
 * Error state for address search operations
 */
export interface AddressSearchError {
  /** Error message for display to user */
  message: string;
  
  /** Error code for programmatic handling */
  code: 'NETWORK_ERROR' | 'TIMEOUT' | 'INVALID_QUERY' | 'API_ERROR' | 'UNKNOWN';
  
  /** Whether the operation can be retried */
  retryable: boolean;
}
