import { useState, useEffect } from 'react';
import { KairosLogo } from './components/KairosLogo';
import { InlineToggle } from './components/InlineToggle';
import { HeroSection } from './components/HeroSection';
import { AddressInput } from './components/AddressInput';
import { MetricCard } from './components/dashboard/MetricCard';
import { PropertyReport } from './components/dashboard/PropertyReport';
import { CMASummary } from './components/dashboard/CMASummary';
import { MarketActivity } from './components/dashboard/MarketActivity';
import { Neighborhoods } from './components/dashboard/Locations';
import { HistoricalTrends } from './components/dashboard/HistoricalTrends';
import { DataTable } from './components/dashboard/DataTable';
import { CMASummaryTable } from './components/dashboard/CMASummaryTable';
import { LocationsTable } from './components/dashboard/LocationsTable';
import { MarketActivityTable } from './components/dashboard/MarketActivityTable';
import {
  PROPERTY_TYPES,
  LOCATIONS,
  PROPERTY_STATUS_GROUPS,
  INITIAL_PROPERTY_STATUSES,
} from './constants';
import { createPropertyStatusHandlers, renderPropertyStatusGroup } from './utils/propertyStatusHelpers';
import type { KairosAddressOutput } from './types/address';
import { loadProjections, formatProjectionLabel, findProjectionByName } from './types/projection';
import type { ProjectionData } from './types/projection';
import { useAuth } from './hooks/useAuth';
import { createAppraisalRecord, updateAppraisalRecord, trackEvent } from './lib/supabase';

// ============================================================================
// FEATURE FLAGS
// ============================================================================
// Set to true to enable, false to hide. No code deletion required.
const FEATURE_FLAGS = {
  PROPERTY_TYPE_DROPDOWN: false, // Set to true to show property type selection
  COMPARISONS_DROPDOWN: true, // Enable when 5+ clients request this feature
};
// ============================================================================

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [compsSelected, setCompsSelected] = useState(true);
  const [isComparisonsOpen, setIsComparisonsOpen] = useState(false);
  const [propertyStatuses, setPropertyStatuses] = useState<Record<string, { selected: boolean; dateRange: string }>>(INITIAL_PROPERTY_STATUSES);
  const [openCalendarDropdown, setOpenCalendarDropdown] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<KairosAddressOutput | null>(null);
  // Inline custom dropdown state for property type and location
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isMarketActivityOpen, setIsMarketActivityOpen] = useState(false);
  
  // CMA generation state
  const [loading, setLoading] = useState(false);
  const [cma, setCma] = useState<null | { 
    properties: Record<string, unknown>[]; 
    stats: { 
      count: number; 
      avg: number; 
      median: number; 
      min: number; 
      max: number; 
    };
    neighborhoods: Record<string, { count: number; mean: number; min: number; max: number }>;
    data_source?: 'live' | 'demo';
  }>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDataTableOpen, setIsDataTableOpen] = useState(false);
  const [isCMASummaryOpen, setIsCMASummaryOpen] = useState(false);
  const [isLocationsOpen, setIsLocationsOpen] = useState(false);

  // ML Projections state
  const [projectionsMap, setProjectionsMap] = useState<Map<string, ProjectionData>>(new Map());
  const [currentProjection, setCurrentProjection] = useState<ProjectionData | null>(null);

  // Get helper functions from utils
  const {
    handleDateRangeSelect,
    handleClickOutside,
    handleSelectAll,
    handleSelectNone,
    handleStatusToggle,
  } = createPropertyStatusHandlers(
    propertyStatuses,
    setPropertyStatuses,
    openCalendarDropdown,
    setOpenCalendarDropdown,
    { property: true, seller: true, market: true, neighborhood: true },
    () => {}
  );

  // Load ML projections on mount
  useEffect(() => {
    loadProjections().then(setProjectionsMap);
  }, []);

  // Update current projection when selected address changes
  useEffect(() => {
    if (selectedAddress?.location?.psgc_province_code) {
      // Try PSGC code match first (for backward compatibility)
      const psgcCode = selectedAddress.location.psgc_province_code.toString();
      let projection = projectionsMap.get(psgcCode);
      
      console.log(`🔍 Looking for projection for PSGC: ${psgcCode}, Address: ${selectedAddress.full_address}`);
      
      // If no PSGC match, try name-based matching
      if (!projection && selectedAddress.full_address) {
        console.log(`No PSGC match, trying name-based matching...`);
        projection = findProjectionByName(projectionsMap, selectedAddress.full_address) || undefined;
      }
      
      setCurrentProjection(projection || null);
      
      if (projection) {
        console.log(`✅ Loaded projection for ${projection.area_name} (PSGC: ${psgcCode})`);
        console.log(`📊 Projection data:`, {
          avg_sold_price: projection.avg_sold_price,
          trend_6m_length: projection.trend_6m.length,
          trend_6m: projection.trend_6m
        });
      } else {
        console.log(`❌ No projection found for PSGC: ${psgcCode} or address: ${selectedAddress.full_address}`);
      }
    } else {
      setCurrentProjection(null);
    }
  }, [selectedAddress, projectionsMap]);

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // CMA generation function
  const generate = async () => {
    // Guard: require selectedAddress with retry for mobile race conditions
    if (!selectedAddress) {
      setError('Please select a property address first.');
      return;
    }

    // Guard: require user authentication
    if (!user) {
      setError('Please wait for authentication to complete.');
      return;
    }

    // Validate selectedAddress data with better error handling
    if (!selectedAddress.location?.psgc_province_code) {
      console.error('❌ Missing PSGC province code:', selectedAddress);
      setError('Invalid address data. Please try selecting the address again.');
      return;
    }

    // Additional validation for mobile race conditions
    if (!selectedAddress.full_address || !selectedAddress.location.coordinates) {
      setError('Address selection incomplete. Please select the address again.');
      return;
    }

    // Extra validation to prevent race conditions
    if (!selectedAddress.location.coordinates.latitude || !selectedAddress.location.coordinates.longitude) {
      setError('Invalid coordinates. Please select the address again.');
      return;
    }

    console.log('🚀 Starting CMA generation for:', selectedAddress.full_address);
    console.log('📍 PSGC Province Code:', selectedAddress.location.psgc_province_code);

    setLoading(true);
    setCma(null);
    setError(null);

    let appraisalId: string | null = null;

    try {
      // Create initial appraisal record
      appraisalId = await createAppraisalRecord(
        user.id,
        selectedAddress.full_address,
        selectedAddress.location.municipality || '',
        selectedAddress.location.province || ''
      );

      if (!appraisalId) {
        console.warn('⚠️ No appraisal ID returned, continuing without tracking')
        appraisalId = `fallback-${Date.now()}`
      }

      // Track login event
      await trackEvent(user.id, 'login', 'User logged in');

      // Use environment variable for API URL or fallback to backend
      const apiUrl = import.meta.env.VITE_API_URL || 'https://cairos.onrender.com';
      const requestBody = {
        psgc_province_code: selectedAddress.location.psgc_province_code,
        property_type: 'condo', // Hardcoded for v1 simplicity
        count: 10,
        appraisal_id: appraisalId // Pass appraisal ID to backend
      };
      
      console.log('🌐 API URL:', apiUrl);
      console.log('📦 Request body:', requestBody);
      
      // Test API connectivity first
      console.log('🔍 Testing API connectivity...');
      try {
        const healthResponse = await fetch(`${apiUrl}/api/addresses/search?q=test&limit=1`, {
          method: 'GET',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          }
        });
        console.log('✅ API health check status:', healthResponse.status);
        
        if (!healthResponse.ok) {
          throw new Error(`API health check failed with status: ${healthResponse.status}`);
        }
      } catch (healthErr) {
        console.error('❌ API health check failed:', healthErr);
        const healthError = healthErr instanceof Error ? healthErr.message : String(healthErr);
        throw new Error(`API server is not accessible: ${healthError}`);
      }
      
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      console.log('📡 Making API request...');
      const response = await fetch(`${apiUrl}/api/cma`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('📡 API response status:', response.status);

      if (response.status === 409) {
        setError('Scraper busy, please try again in a few minutes.');
        
        // Update appraisal record with failure
        if (appraisalId) {
          await updateAppraisalRecord(appraisalId, {
            status: 'failed',
            error_type: 'scraper_busy',
            error_message: 'Scraper busy, please try again in a few minutes.'
          });
        }
        return;
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setCma(data);

      // Update appraisal record with success (backend should have done this, but just in case)
      if (appraisalId) {
        await updateAppraisalRecord(appraisalId, {
          status: 'completed',
          completed_at: new Date().toISOString(),
          properties_found: data.stats?.count || 0
        });
      }

    } catch (err) {
      console.error('❌ CMA generation failed:', err);
      console.error('❌ Error type:', err instanceof Error ? err.constructor.name : typeof err);
      console.error('❌ Error message:', err instanceof Error ? err.message : String(err));
      console.error('❌ Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      
      let errorMessage = 'Failed to generate CMA. Please try again.';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (err.message.includes('CORS')) {
          errorMessage = 'Connection error. Please try again in a moment.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          errorMessage = `Error: ${err.message}`;
        }
      }
      
      console.error('❌ Setting error message:', errorMessage);
      
      // Show detailed error on mobile for debugging
      const detailedError = `Error: ${errorMessage}\n\nDebug Info:\n- API URL: ${apiUrl}\n- PSGC Code: ${selectedAddress?.location?.psgc_province_code || 'Missing'}\n- Error Type: ${err instanceof Error ? err.constructor.name : typeof err}\n- Error Message: ${err instanceof Error ? err.message : String(err)}`;
      
      setError(detailedError);

      // Update appraisal record with failure
      if (appraisalId) {
        await updateAppraisalRecord(appraisalId, {
          status: 'failed',
          error_type: 'client_error',
          error_message: errorMessage
        });

        // Track the error
        await trackEvent(user.id, 'error', `CMA generation failed: ${errorMessage}`, {
          error_type: 'client_error',
          appraisal_id: appraisalId
        });
      }
    } finally {
      setLoading(false);
    }
  };


  // Show loading state while authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen bg-kairos-chalk flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-kairos-charcoal">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kairos-chalk" onClick={handleClickOutside}>
      {/* Header with Logo */}
      <header className="w-full py-4 px-4 sm:py-6 sm:px-8">
        <KairosLogo iconSize="xl" labelSize="xl" />
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-16 max-w-full sm:max-w-4xl mx-auto">
        {/* Hero Section */}
        <HeroSection />

        {/* Input Interface with Inline Toggles */}
        <div className="w-full max-w-full sm:max-w-4xl">
          <div className="relative bg-kairos-white-porcelain border-2 border-kairos-white-grey rounded-3xl shadow-sm focus-within:border-kairos-charcoal transition-colors duration-200 pb-4">
            <div className="relative">
              <AddressInput 
                onSelect={setSelectedAddress}
                placeholder="Enter property address..."
              />
            </div>
            
            {/* Toggle Buttons at Bottom */}
            <div className="px-4 sm:px-6 flex gap-2" style={{ visibility: FEATURE_FLAGS.COMPARISONS_DROPDOWN ? 'visible' : 'hidden' }}>
              <InlineToggle
                label="Comparables"
                isSelected={compsSelected}
                onToggle={() => {
                  setCompsSelected(!compsSelected);
                  setIsComparisonsOpen((prev) => !prev);
                }}
                showDropdownChevron
                isOpen={isComparisonsOpen}
              />
            </div>
            
            {/* ========================================================================
                DESIGN CHECKPOINT: Comparisons Dropdown Panel
                ========================================================================
                
                This dropdown embodies Kairos design system principles:
                "Calm in the chaos" - clean, minimal, professional
                
                CANONICAL STYLING (DO NOT CHANGE WITHOUT PERMISSION):
                
                Panel Container:
                - rounded-3xl (NOT rounded-lg or rounded-xl)
                - bg-white/95 (semi-transparent white, 95% opacity)
                - border border-[#E5E4E6] (subtle neutral gray)
                - shadow-lg (visible but subtle depth)
                - Positioning: absolute top-full left-0 right-0 mt-2
                - z-50 (above other content)
                
                Property Type / Location Selectors:
                - bg-[#F3F3F2] (light gray, matches design system)
                - border border-[#E5E4E6] (consistent with panel)
                - rounded (standard, NOT rounded-xl)
                - h-10 (fixed height for consistency)
                - pr-10 (space for chevron icon)
                
                Section Dividers:
                - border-b border-[#E5E4E6]
                - Consistent spacing: p-4
                
                WHY THIS STYLING:
                - rounded-3xl: Modern, friendly, matches dashboard cards
                - bg-white/95: Subtle transparency, professional depth
                - shadow-lg: Clear visual hierarchy without harshness
                - Generous padding: Reduces cognitive load, easy scanning
                - Consistent colors: Visual cohesion with rest of app
                
                PROTECTED ELEMENTS:
                - Border radius (must stay rounded-3xl)
                - Background transparency (white/95)
                - Shadow intensity (shadow-lg)
                - Section padding (p-4)
                - Input field heights (h-10)
                - Color palette (#E5E4E6, #F3F3F2, #3B3832, #7A7873)
                
                See KAIROS-GUARDRAILS.md > COMPARISONS DROPDOWN DESIGN GUARDRAIL
            ======================================================================== */}
            {FEATURE_FLAGS.COMPARISONS_DROPDOWN && isComparisonsOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/95 border border-[#E5E4E6] rounded-3xl shadow-lg max-h-96 sm:max-h-none overflow-y-auto">
                {/* Property Type Section */}
                {FEATURE_FLAGS.PROPERTY_TYPE_DROPDOWN && (
                  <div className="p-3 sm:p-4 border-b border-[#E5E4E6]">
                    <label className="font-['Avenir'] text-sm text-[#3B3832] mb-2 block">
                      Select Property Type
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsPropertyTypeOpen(o => !o)}
                        className="w-full h-10 px-3 pr-10 text-left border border-[#E5E4E6] rounded bg-[#F3F3F2]"
                      >
                        <span className={`${selectedPropertyType ? 'text-[#3B3832]' : 'text-[#7A7873]'}`}>
                          {selectedPropertyType ? PROPERTY_TYPES.find(o => o.value === selectedPropertyType)?.label : 'Choose property type...'}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                          <svg className={`w-3.5 h-3.5 text-[#6B7280] transition-transform ${isPropertyTypeOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </button>
                      {isPropertyTypeOpen && (
                        <ul className="absolute z-50 top-full left-0 right-0 mt-2 max-h-60 overflow-auto rounded-2xl border border-[#E5E4E6] bg-white/95 shadow-lg">
                          {PROPERTY_TYPES.map((opt) => (
                            <li key={opt.value}>
                              <button
                                type="button"
                                className={`w-full text-left px-3 py-2 hover:bg-[#E7E7EB] ${opt.value === selectedPropertyType ? 'bg-[#F3F3F2]' : ''}`}
                                onClick={() => { setSelectedPropertyType(opt.value); setIsPropertyTypeOpen(false); }}
                              >
                                {opt.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Location Section */}
                <div className="p-3 sm:p-4 border-b border-[#E5E4E6]">
                  <label className="font-['Avenir'] text-sm text-[#3B3832] mb-2 block">
                    Select Location
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsLocationOpen(o => !o)}
                      className="w-full h-10 px-3 pr-10 text-left border border-[#E5E4E6] rounded bg-[#F3F3F2]"
                    >
                      <span className={`${selectedLocation ? 'text-[#3B3832]' : 'text-[#7A7873]'}`}>
                        {selectedLocation ? LOCATIONS.find(o => o.value === selectedLocation)?.label : 'Choose location...'}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg className={`w-3.5 h-3.5 text-[#6B7280] transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </button>
                    {isLocationOpen && (
                      <ul className="absolute z-50 top-full left-0 right-0 mt-2 max-h-60 overflow-auto rounded-2xl border border-[#E5E4E6] bg-white/95 shadow-lg">
                        {LOCATIONS.map((opt) => (
                          <li key={opt.value}>
                            <button
                              type="button"
                              className={`w-full text-left px-3 py-2 hover:bg-[#E7E7EB] ${opt.value === selectedLocation ? 'bg-[#F3F3F2]' : ''}`}
                              onClick={() => { setSelectedLocation(opt.value); setIsLocationOpen(false); }}
                            >
                              {opt.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                
                {/* Results Section */}
                <div className="flex justify-between items-center px-3 sm:px-4 pt-3 sm:pt-4 no-bottom-padding">
                  <div className="flex gap-4">
                    <button 
                      className="text-sm text-[#3B3832] hover:underline"
                      onClick={handleSelectAll}
                    >
                      Select All
                    </button>
                    <button 
                      className="text-sm text-[#3B3832] hover:underline"
                      onClick={handleSelectNone}
                    >
                      Select None
                    </button>
                  </div>
                  
                </div>
                
                {/* Status - Dates or Days Section */}
                <div>
                  <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 space-y-1">
                    {renderPropertyStatusGroup(
                      'Active Market Data',
                      PROPERTY_STATUS_GROUPS.activeMarket,
                      'shows current market conditions and pricing trends',
                      propertyStatuses,
                      handleStatusToggle,
                      openCalendarDropdown,
                      setOpenCalendarDropdown,
                      handleDateRangeSelect
                    )}
                    
                    {renderPropertyStatusGroup(
                      'Recent Market Activity',
                      PROPERTY_STATUS_GROUPS.recentActivity,
                      'indicates recent market activity',
                      propertyStatuses,
                      handleStatusToggle,
                      openCalendarDropdown,
                      setOpenCalendarDropdown,
                      handleDateRangeSelect
                    )}
                    
                    {renderPropertyStatusGroup(
                      'Historical Sales Data',
                      PROPERTY_STATUS_GROUPS.historicalSales,
                      'provides completed transaction data for comparison',
                      propertyStatuses,
                      handleStatusToggle,
                      openCalendarDropdown,
                      setOpenCalendarDropdown,
                      handleDateRangeSelect
                    )}
                    
                    {renderPropertyStatusGroup(
                      'Other Statuses',
                      PROPERTY_STATUS_GROUPS.other,
                      'additional property status options',
                      propertyStatuses,
                      handleStatusToggle,
                      openCalendarDropdown,
                      setOpenCalendarDropdown,
                      handleDateRangeSelect
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Prominent Search Button */}
            <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
              <button
                disabled={!compsSelected || loading || !selectedAddress}
                aria-disabled={!compsSelected || loading || !selectedAddress}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl shadow-md transition-all duration-200 ${
                  !compsSelected || loading || !selectedAddress
                    ? 'bg-kairos-white-grey text-kairos-charcoal/40 cursor-not-allowed'
                    : 'bg-black hover:bg-gray-800 text-white hover:shadow-lg'
                }`}
                onClick={async () => {
                  // Button is now properly disabled, so we can trust the state
                  if (loading || !selectedAddress) return;
                  
                  // Small delay to ensure state is properly set on mobile
                  await new Promise(resolve => setTimeout(resolve, 50));
                  generate();
                }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium">
                      Generating Reports
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs sm:text-sm font-medium">
                      Generate Reports
                    </span>
                    <div className="w-5 h-5 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </>
                )}
              </button>
            </div>

            {/* Report Type Dropdown removed */}
          </div>
        </div>

        {/* CMA Results Display */}
        {cma && (
          <div className="min-h-screen bg-kairos-chalk p-4 sm:p-8">
            {cma.stats.count === 0 ? (
              <div className="mx-auto max-w-2xl text-center">
                <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-12">
                  <div className="mx-auto mb-6 inline-block rotate-3">
                    <div className="rounded-2xl border border-gray-200 shadow-sm bg-white p-3">
                      {/* Sad black cat sticker (monochrome to match design system) */}
                      <svg
                        className="w-12 h-12"
                        viewBox="0 0 64 64"
                        aria-label="Sad black cat sticker"
                        role="img"
                      >
                        {/* Cat head */}
                        <path fill="#111111" d="M12 26c0-6 3.5-9.5 9.5-12.5l3-1.5c1.2-.6 2.2.2 2.6 1.5l1.3 4.3c.3 1 .9 1.2 1.6 1.2s1.3-.2 1.6-1.2l1.3-4.3c.4-1.4 1.4-2.1 2.6-1.5l3 1.5C48.5 16.5 52 20 52 26v6c0 10.5-8.5 19-20 19S12 42.5 12 32v-6z"/>
                        {/* Eyes */}
                        <circle cx="26" cy="32" r="3" fill="#FFFFFC"/>
                        <circle cx="38" cy="32" r="3" fill="#FFFFFC"/>
                        <circle cx="26" cy="32" r="1.5" fill="#111111"/>
                        <circle cx="38" cy="32" r="1.5" fill="#111111"/>
                        {/* Sad mouth */}
                        <path d="M24 44c2.5-2.8 6.5-2.8 9 0" stroke="#FFFFFC" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
                  <p className="text-gray-600">Apologies, no properties found in this location. Please try searching in a different area.</p>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Properties" value={cma.stats.count.toString()} />
        <MetricCard title="Avg Price" value={`₱${Math.round(cma.stats.avg).toLocaleString()}`} />
        <MetricCard 
          title="Avg Days on Market" 
          value={currentProjection ? Math.round(currentProjection.avg_dom).toString() : "N/A"} 
          note={formatProjectionLabel(currentProjection)} 
        />
                  <MetricCard title="Total Neighborhoods" value={Object.keys(cma.neighborhoods || {}).length.toString()} subtitle="Active areas" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                  <PropertyReport cma={cma} onOpenDataTable={() => setIsDataTableOpen(true)} />
                  <CMASummary cma={cma} onOpenCMASummary={() => setIsCMASummaryOpen(true)} />
                  <MarketActivity cma={cma} projection={currentProjection} onOpenMarketActivity={() => setIsMarketActivityOpen(true)} />
                  <Neighborhoods cma={cma} onOpenLocations={() => setIsLocationsOpen(true)} />
                </div>

                <div>
                  <HistoricalTrends cma={cma} projection={currentProjection} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="w-full max-w-2xl mt-6 sm:mt-8 bg-red-50 border border-red-200 rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={clearError}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Dismiss
                </button>
              </div>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
                aria-label="Close error message"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        {/* Data Table Modal */}
        <DataTable open={isDataTableOpen} onClose={() => setIsDataTableOpen(false)} properties={(cma?.properties as any[]) || []} />
        {/* CMA Summary Table Modal */}
        <CMASummaryTable open={isCMASummaryOpen} onClose={() => setIsCMASummaryOpen(false)} cma={cma as any} projection={currentProjection} />
        {/* Locations Table Modal */}
        <LocationsTable open={isLocationsOpen} onClose={() => setIsLocationsOpen(false)} cma={cma as any} projection={currentProjection} />
        {/* Market Activity Table Modal */}
        <MarketActivityTable open={isMarketActivityOpen} onClose={() => setIsMarketActivityOpen(false)} projection={currentProjection} />
      </main>

      {/* Subtle Grid Background Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02] z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, #2C2C2C 1px, transparent 1px), linear-gradient(to bottom, #2C2C2C 1px, transparent 1px)",
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
}