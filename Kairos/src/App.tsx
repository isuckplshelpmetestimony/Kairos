import React, { useState } from 'react';
import { KairosLogo } from './components/KairosLogo';
import { InlineToggle } from './components/InlineToggle';
import { HeroSection } from './components/HeroSection';
import { AddressInput } from './components/AddressInput';
import { MetricCard } from './components/dashboard/MetricCard';
import { PropertyReport } from './components/dashboard/PropertyReport';
import { CMASummary } from './components/dashboard/CMASummary';
import { MarketActivity } from './components/dashboard/MarketActivity';
import { Neighborhoods } from './components/dashboard/Neighborhoods';
import { HistoricalTrends } from './components/dashboard/HistoricalTrends';
import {
  PROPERTY_TYPES,
  LOCATIONS,
  PROPERTY_STATUS_GROUPS,
  INITIAL_PROPERTY_STATUSES,
} from './constants';
import { createPropertyStatusHandlers, renderPropertyStatusGroup } from './utils/propertyStatusHelpers';
import type { KairosAddressOutput } from './types/address';


export default function App() {
  const [reportTypeSelected, setReportTypeSelected] = useState(true);
  const [compsSelected, setCompsSelected] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isComparisonsOpen, setIsComparisonsOpen] = useState(false);
  const [selectedReports, setSelectedReports] = useState({
    property: true,
    seller: true,
    market: true,
    neighborhood: true,
  });
  const [propertyStatuses, setPropertyStatuses] = useState<Record<string, { selected: boolean; dateRange: string }>>(INITIAL_PROPERTY_STATUSES);
  const [openCalendarDropdown, setOpenCalendarDropdown] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<KairosAddressOutput | null>(null);
  
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
    data_source?: 'live' | 'demo';
  }>(null);
  const [error, setError] = useState<string | null>(null);

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
    selectedReports,
    setSelectedReports
  );

  const handleReportToggle = (reportType: keyof typeof selectedReports) => {
    setSelectedReports(prev => ({ ...prev, [reportType]: !prev[reportType] }));
  };

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cma`, {
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
        <div className="w-full max-w-2xl">
          <div className="relative bg-kairos-white-porcelain border-2 border-kairos-white-grey rounded-2xl shadow-sm focus-within:border-kairos-charcoal transition-colors duration-200 pb-4">
            <div className="relative">
              <AddressInput 
                onSelect={setSelectedAddress}
                placeholder="Enter property address..."
              />
            </div>
            
            {/* Toggle Buttons at Bottom */}
            <div className="px-6 flex gap-2">
              <InlineToggle
                label="Report Type"
                isSelected={reportTypeSelected}
                onToggle={() => {
                  setReportTypeSelected(!reportTypeSelected);
                  setIsDropdownOpen((prev) => !prev);
                  // Close Comparisons dropdown when Report Type opens
                  if (!isDropdownOpen) {
                    setIsComparisonsOpen(false);
                    setCompsSelected(false);
                  }
                }}
                showDropdownChevron
                isOpen={isDropdownOpen}
              />
              <InlineToggle
                label="Comparisons"
                isSelected={compsSelected}
                onToggle={() => {
                  setCompsSelected(!compsSelected);
                  setIsComparisonsOpen((prev) => !prev);
                  // Close Report Type dropdown when Comparisons opens
                  if (!isComparisonsOpen) {
                    setIsDropdownOpen(false);
                    setReportTypeSelected(false);
                  }
                }}
                showDropdownChevron
                isOpen={isComparisonsOpen}
              />
            </div>
            
            {/* Comparisons Dropdown */}
            {isComparisonsOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#FFFFFC] border border-[#E5E4E6] rounded-lg shadow-lg">
                {/* Property Type Section */}
                <div className="p-4 border-b border-[#E5E4E6]">
                  <label className="font-['Futura'] text-sm text-[#3B3832] mb-2 block">
                    Select Property Type
                  </label>
                  <select className="w-full p-2 border border-[#E5E4E6] rounded bg-[#F3F3F2]">
                    {PROPERTY_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Location Section */}
                <div className="p-4 border-b border-[#E5E4E6]">
                  <label className="font-['Futura'] text-sm text-[#3B3832] mb-2 block">
                    Select Location
                  </label>
                  <select className="w-full p-2 border border-[#E5E4E6] rounded bg-[#F3F3F2]">
                    {LOCATIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
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
                  <button className="px-4 py-2 bg-[#3B3832] text-white rounded-lg text-sm font-medium hover:bg-[#2A2824] transition-colors">
                    View Results
                  </button>
                </div>
                
                {/* Status - Dates or Days Section */}
                <div>
                  <div className="px-4 py-2 space-y-1">
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
                disabled={(!reportTypeSelected && !compsSelected) || loading}
                aria-disabled={(!reportTypeSelected && !compsSelected) || loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-md transition-all duration-200 ${
                  (!reportTypeSelected && !compsSelected) || loading
                    ? 'bg-kairos-white-grey text-kairos-charcoal/40 cursor-not-allowed'
                    : 'bg-kairos-soft-black hover:bg-kairos-charcoal text-kairos-chalk hover:shadow-lg'
                }`}
                onClick={generate}
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                    <span className="text-sm font-medium">
                      Scraping live data (5–10 minutes)...
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

            {/* Report Type Dropdown - positioned below entire card */}
            {isDropdownOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#FFFFFC] border border-[#E5E4E6] rounded-lg shadow-lg"
                role="listbox"
                aria-label="Select report type"
              >
                {Object.entries(selectedReports).map(([reportType, isSelected], index, array) => (
                  <div 
                    key={reportType}
                    className={`w-full p-4 hover:bg-[#E7E7EB] flex items-center justify-between text-left ${
                      index < array.length - 1 ? 'border-b border-[#E5E4E6]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleReportToggle(reportType as keyof typeof selectedReports)}
                        aria-label={`Select ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`}
                        className="w-4 h-4 rounded border-[#E5E4E6]"
                        style={{ accentColor: '#E5FFCC' }}
                      />
                      <span className="font-['Futura']">
                        {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
                      </span>
                    </div>
                    <span className="font-['Avenir'] text-sm text-[#7A7873]">
                      Sample available after generation
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CMA Results Display */}
        {cma && (
          <div className="min-h-screen bg-kairos-chalk p-8">
            <div className="mx-auto max-w-7xl space-y-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Total Properties" value={cma.stats.count.toString()} change="+12% from last month" positive />
                <MetricCard title="Avg Price" value={`₱${Math.round(cma.stats.avg).toLocaleString()}`} change="+2.3% from last month" positive />
                <MetricCard title="Avg Days on Market" value="28" change="-5 days from last month" positive note="Mock data placeholder" />
                <MetricCard title="Total Neighborhoods" value="42" subtitle="Active areas" note="Mock data placeholder" />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <PropertyReport cma={cma} />
                <CMASummary cma={cma} />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <MarketActivity cma={cma} />
                <Neighborhoods cma={cma} />
              </div>

              <div>
                <HistoricalTrends cma={cma} />
              </div>
            </div>
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