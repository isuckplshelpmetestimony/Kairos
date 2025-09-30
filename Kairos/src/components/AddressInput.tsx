/**
 * AddressInput Component
 * 
 * Philippine address autocomplete input with dropdown suggestions.
 * Integrates with useAddressSearch hook and outputs structured KairosAddressOutput.
 * 
 * Features:
 * - Debounced search (300ms via hook)
 * - Loading states with spinner
 * - Dropdown suggestions list
 * - Selection handling with clear button
 * - Error handling with retry
 * - Outputs structured location data for CMA generation
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAddressSearch } from '@/hooks/useAddressSearch';
import type { AddressSuggestion, KairosAddressOutput } from '@/types/address';

interface AddressInputProps {
  /** Callback fired when user selects an address */
  onSelect: (address: KairosAddressOutput) => void;
  
  /** Optional placeholder text */
  placeholder?: string;
  
  /** Optional initial value */
  defaultValue?: string;
}

/**
 * Transform AddressSuggestion (from API) to KairosAddressOutput (for CMA)
 * This creates the structured location object with PSGC codes for scraper targeting
 */
function transformToKairosOutput(suggestion: AddressSuggestion): KairosAddressOutput {
  return {
    full_address: suggestion.full_address,
    location: {
      psgc_city_code: suggestion.psgc_city_code,
      psgc_province_code: suggestion.psgc_province_code,
      coordinates: {
        latitude: suggestion.coordinates[0],
        longitude: suggestion.coordinates[1]
      }
    },
    search_parameters: {
      radius_km: suggestion.search_radius_km,
      confidence_level: suggestion.confidence_level
    },
    selected_at: new Date().toISOString()
  };
}

export function AddressInput({ 
  onSelect, 
  placeholder = "Enter property address...",
  defaultValue = ""
}: AddressInputProps) {
  const [query, setQuery] = useState(defaultValue);
  const [selectedAddress, setSelectedAddress] = useState<KairosAddressOutput | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Hook provides debounced search, loading state, and error handling
  const { suggestions, isLoading, error, clearError } = useAddressSearch(query);
  
  // Open dropdown when suggestions are available
  useEffect(() => {
    if (suggestions.length > 0 && !selectedAddress) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, [suggestions, selectedAddress]);
  
  // Handle address selection
  const handleSelect = (suggestion: AddressSuggestion) => {
    const kairosOutput = transformToKairosOutput(suggestion);
    setSelectedAddress(kairosOutput);
    setQuery(suggestion.full_address);
    setIsDropdownOpen(false);
    setFocusedIndex(-1);
    onSelect(kairosOutput);
  };
  
  // Handle clear button
  const handleClear = () => {
    setSelectedAddress(null);
    setQuery('');
    setIsDropdownOpen(false);
    setFocusedIndex(-1);
    clearError();
    inputRef.current?.focus();
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedAddress(null);
    clearError();
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || suggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
          handleSelect(suggestions[focusedIndex]);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setIsDropdownOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setFocusedIndex(-1);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="relative w-full">
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-16 px-6 pr-32 text-lg bg-transparent border-none outline-none placeholder:text-kairos-charcoal/40 text-kairos-charcoal"
          aria-label="Property address search"
          aria-autocomplete="list"
          aria-controls="address-suggestions"
          aria-expanded={isDropdownOpen}
          autoComplete="off"
        />
        
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute right-20 top-1/2 -translate-y-1/2">
            <svg 
              className="animate-spin h-5 w-5 text-kairos-charcoal/60" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
        
        {/* Clear Button */}
        {(selectedAddress || query) && !isLoading && (
          <button
            onClick={handleClear}
            className="absolute right-20 top-1/2 -translate-y-1/2 p-1 hover:bg-kairos-white-grey rounded-full transition-colors"
            aria-label="Clear address"
            type="button"
          >
            <svg 
              className="w-5 h-5 text-kairos-charcoal/60 hover:text-kairos-charcoal" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
        
        {/* Selected Address Indicator */}
        {selectedAddress && (
          <div className="absolute right-32 top-1/2 -translate-y-1/2">
            <svg 
              className="w-5 h-5 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        )}
      </div>
      
      {/* Dropdown Suggestions */}
      {isDropdownOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          id="address-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 z-50 bg-kairos-chalk border border-kairos-white-grey rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.psgc_city_code}-${index}`}
              type="button"
              role="option"
              aria-selected={index === focusedIndex}
              onClick={() => handleSelect(suggestion)}
              className={`w-full text-left px-4 py-3 transition-colors border-b border-kairos-white-grey last:border-b-0 ${
                index === focusedIndex 
                  ? 'bg-kairos-base-color' 
                  : 'hover:bg-kairos-base-color'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-kairos-charcoal font-medium truncate">
                    {suggestion.full_address}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-kairos-charcoal/60">
                      {suggestion.search_radius_km}km radius
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      suggestion.confidence_level === 'high' 
                        ? 'bg-green-100 text-green-700' 
                        : suggestion.confidence_level === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {suggestion.confidence_level}
                    </span>
                  </div>
                </div>
                
                {/* Location Pin Icon */}
                <svg 
                  className="w-5 h-5 text-kairos-charcoal/40 flex-shrink-0 mt-0.5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-kairos-chalk border border-red-300 rounded-lg shadow-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 flex-1">
              <svg 
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <div>
                <p className="text-kairos-charcoal font-medium">
                  {error.message}
                </p>
                {error.retryable && (
                  <button
                    onClick={clearError}
                    className="mt-2 text-sm text-kairos-charcoal/70 hover:text-kairos-charcoal underline"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-kairos-charcoal/60 hover:text-kairos-charcoal"
              aria-label="Close error message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* No Results Message */}
      {!isLoading && !error && query.trim().length >= 2 && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-kairos-chalk border border-kairos-white-grey rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-2 text-kairos-charcoal/70">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm">No addresses found. Try a different search.</p>
          </div>
        </div>
      )}
    </div>
  );
}
