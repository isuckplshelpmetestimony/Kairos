import React, { useState } from 'react';
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
import {
  PROPERTY_TYPES,
  LOCATIONS,
  PROPERTY_STATUS_GROUPS,
  INITIAL_PROPERTY_STATUSES,
} from './constants';
import { createPropertyStatusHandlers, renderPropertyStatusGroup } from './utils/propertyStatusHelpers';
import type { KairosAddressOutput } from './types/address';


export default function App() {
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


  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // CMA generation function
  const generate = async () => {
    // Guard: require selectedAddress
    if (!selectedAddress) {
      setError('Please select a property address first.');
      return;
    }

    setLoading(true);
    
    setCma(null);
    setError(null);

    try {
      // start polling progress
      
      const response = await fetch(`/api/cma`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          psgc_province_code: selectedAddress.location.psgc_province_code,
          property_type: 'condo', // Hardcoded for v1 simplicity
          count: 50
        }),
      });

      if (response.status === 409) {
        setError('Scraper busy, please try again in a few minutes.');
        
        return;
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setCma(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate CMA. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      
    }
  };


  return (
    <div className="min-h-screen bg-kairos-chalk" onClick={handleClickOutside}>
      {/* Header with Logo */}
      <header className="w-full py-6 px-8">
        <KairosLogo iconSize="xl" labelSize="xl" />
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-8 py-16 max-w-4xl mx-auto">
        {/* Hero Section */}
        <HeroSection />

        {/* Input Interface with Inline Toggles */}
        <div className="w-full max-w-4xl">
          <div className="relative bg-kairos-white-porcelain border-2 border-kairos-white-grey rounded-3xl shadow-sm focus-within:border-kairos-charcoal transition-colors duration-200 pb-4">
            <div className="relative">
              <AddressInput 
                onSelect={setSelectedAddress}
                placeholder="Enter property address..."
              />
            </div>
            
            {/* Toggle Buttons at Bottom */}
            <div className="px-6 flex gap-2">
              <InlineToggle
                label="Comparisons"
                isSelected={compsSelected}
                onToggle={() => {
                  setCompsSelected(!compsSelected);
                  setIsComparisonsOpen((prev) => !prev);
                }}
                showDropdownChevron
                isOpen={isComparisonsOpen}
              />
            </div>
            
            {/* Comparisons Dropdown */}
            {isComparisonsOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/95 border border-[#E5E4E6] rounded-3xl shadow-lg">
                {/* Property Type Section */}
                <div className="p-4 border-b border-[#E5E4E6]">
                  <label className="font-['Futura'] text-sm text-[#3B3832] mb-2 block">
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
                
                {/* Location Section */}
                <div className="p-4 border-b border-[#E5E4E6]">
                  <label className="font-['Futura'] text-sm text-[#3B3832] mb-2 block">
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
                <div className="flex justify-between items-center px-4 pt-4 no-bottom-padding">
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
                  <div className="px-4 pt-4 pb-2 space-y-1">
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
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <button
                disabled={!compsSelected || loading}
                aria-disabled={!compsSelected || loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-md transition-all duration-200 ${
                  !compsSelected || loading
                    ? 'bg-kairos-white-grey text-kairos-charcoal/40 cursor-not-allowed'
                    : 'bg-black hover:bg-gray-800 text-white hover:shadow-lg'
                }`}
                onClick={generate}
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                    <span className="text-sm font-medium">
                      Generating Reports
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium">
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
          <div className="min-h-screen bg-kairos-chalk p-8">
            {cma.stats.count === 0 ? (
              <div className="mx-auto max-w-2xl text-center">
                <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-12">
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
              <div className="mx-auto max-w-7xl space-y-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <MetricCard title="Total Properties" value={cma.stats.count.toString()} change="+12% from last month" positive />
                  <MetricCard title="Avg Price" value={`₱${Math.round(cma.stats.avg).toLocaleString()}`} change="+2.3% from last month" positive />
                  <MetricCard title="Avg Days on Market" value="28" change="-5 days from last month" positive note="Mock data placeholder" />
                  <MetricCard title="Total Neighborhoods" value={Object.keys(cma.neighborhoods || {}).length.toString()} subtitle="Active areas" />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <PropertyReport cma={cma} onOpenDataTable={() => setIsDataTableOpen(true)} />
                  <CMASummary cma={cma} onOpenCMASummary={() => setIsCMASummaryOpen(true)} />
                  <MarketActivity cma={cma} />
                  <Neighborhoods cma={cma} onOpenLocations={() => setIsLocationsOpen(true)} />
                </div>

                <div>
                  <HistoricalTrends cma={cma} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="w-full max-w-2xl mt-8 bg-red-50 border border-red-200 rounded-2xl shadow-sm p-6">
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
        <CMASummaryTable open={isCMASummaryOpen} onClose={() => setIsCMASummaryOpen(false)} cma={cma} />
        {/* Locations Table Modal */}
        <LocationsTable open={isLocationsOpen} onClose={() => setIsLocationsOpen(false)} cma={cma} />
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