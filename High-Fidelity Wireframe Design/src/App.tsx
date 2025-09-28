import React, { useState } from 'react';
import { KairosLogo } from './components/KairosLogo';
import { InlineToggle } from './components/InlineToggle';
import { HeroSection } from './components/HeroSection';

// Constants
const DATE_RANGE_OPTIONS = [
  { label: 'Last 30 days', value: '0-30' },
  { label: 'Last 60 days', value: '0-60' },
  { label: 'Last 90 days', value: '0-90' },
  { label: 'Last 180 days', value: '0-180' },
] as const;

const PROPERTY_TYPES = [
  { value: '', label: 'Choose property type...' },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
] as const;

const LOCATIONS = [
  { value: '', label: 'Choose location...' },
  { value: 'downtown', label: 'Downtown' },
  { value: 'suburbs', label: 'Suburbs' },
  { value: 'waterfront', label: 'Waterfront' },
] as const;

const PROPERTY_STATUS_GROUPS = {
  activeMarket: ['Coming Soon', 'Active', 'Active Under Contract'],
  recentActivity: ['Temporary Off Market', 'Pending'],
  historicalSales: ['Closed'],
  other: ['Withdrawn', 'Expired', 'Canceled'],
} as const;

const INITIAL_PROPERTY_STATUSES = {
  'Coming Soon': { selected: false, dateRange: '0-90' },
  'Active': { selected: true, dateRange: '0-90' },
  'Active Under Contract': { selected: true, dateRange: '0-90' },
  'Temporary Off Market': { selected: true, dateRange: '0-90' },
  'Pending': { selected: true, dateRange: '0-90' },
  'Withdrawn': { selected: false, dateRange: '0-90' },
  'Closed': { selected: true, dateRange: '0-180' },
  'Expired': { selected: false, dateRange: '0-90' },
  'Canceled': { selected: false, dateRange: '0-90' },
} as const;

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

  // Helper functions
  const handleDateRangeSelect = (status: string, range: string) => {
    setPropertyStatuses(prev => ({
      ...prev,
      [status]: { ...prev[status], dateRange: range }
    }));
    setOpenCalendarDropdown(null);
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (openCalendarDropdown && !(e.target as HTMLElement).closest('.calendar-dropdown')) {
      setOpenCalendarDropdown(null);
    }
  };

  const handleSelectAll = () => {
    const newStatuses = { ...propertyStatuses };
    Object.keys(newStatuses).forEach(key => {
      newStatuses[key].selected = true;
    });
    setPropertyStatuses(newStatuses);
  };

  const handleSelectNone = () => {
    const newStatuses = { ...propertyStatuses };
    Object.keys(newStatuses).forEach(key => {
      newStatuses[key].selected = false;
    });
    setPropertyStatuses(newStatuses);
  };

  const handleStatusToggle = (status: string, checked: boolean) => {
    setPropertyStatuses(prev => ({
      ...prev,
      [status]: { ...prev[status], selected: checked }
    }));
  };

  const handleReportToggle = (reportType: keyof typeof selectedReports) => {
    setSelectedReports(prev => ({ ...prev, [reportType]: !prev[reportType] }));
  };

  // Render property status group
  const renderPropertyStatusGroup = (groupName: string, statuses: readonly string[], description: string) => {
    return (
      <div className="mb-2">
        <div className="text-xs text-[#7A7873] mb-2">
          <strong style={{ fontWeight: 900 }}>{groupName}:</strong>
        </div>
        {statuses.map((status) => {
          const { selected, dateRange } = propertyStatuses[status];
          return (
            <div key={status} className={`flex items-center gap-3 p-2 rounded ${selected ? 'bg-blue-50' : ''}`}>
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => handleStatusToggle(status, e.target.checked)}
                className="w-4 h-4 rounded border-[#E5E4E6]"
                style={{ accentColor: '#E5FFCC' }}
              />
              <span className="text-sm text-[#3B3832] flex-1">{status}</span>
              <div className="relative">
                <input
                  type="text"
                  value={dateRange}
                  readOnly
                  className="w-20 px-2 py-1 text-sm border border-[#E5E4E6] rounded bg-white cursor-pointer"
                  onClick={() => setOpenCalendarDropdown(openCalendarDropdown === status ? null : status)}
                />
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                  <button
                    type="button"
                    onClick={() => setOpenCalendarDropdown(openCalendarDropdown === status ? null : status)}
                    className="w-4 h-4 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                
                {openCalendarDropdown === status && (
                  <div
                    style={{
                      position: 'absolute',
                      backgroundColor: 'white',
                      zIndex: 1000,
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      padding: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      minWidth: '140px',
                      top: '100%',
                      right: 0,
                    }}
                  >
                    {DATE_RANGE_OPTIONS.map((option) => (
                      <div
                        key={option.value}
                        onClick={() => handleDateRangeSelect(status, option.value)}
                        className="p-2 text-sm text-left text-[#3B3832] hover:bg-[#E7E7EB] cursor-pointer"
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <p className="text-xs text-[#7A7873] ml-6 description-spacing">{description}</p>
      </div>
    );
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
              <input
                type="text"
                placeholder="Enter property address..."
                className="w-full h-16 px-6 pr-32 text-lg bg-transparent border-none outline-none placeholder:text-kairos-charcoal/40"
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
                      'shows current market conditions and pricing trends'
                    )}
                    
                    {renderPropertyStatusGroup(
                      'Recent Market Activity',
                      PROPERTY_STATUS_GROUPS.recentActivity,
                      'indicates recent market activity'
                    )}
                    
                    {renderPropertyStatusGroup(
                      'Historical Sales Data',
                      PROPERTY_STATUS_GROUPS.historicalSales,
                      'provides completed transaction data for comparison'
                    )}
                    
                    {renderPropertyStatusGroup(
                      'Other Statuses',
                      PROPERTY_STATUS_GROUPS.other,
                      'additional property status options'
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Prominent Search Button */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <button
                disabled={!reportTypeSelected && !compsSelected}
                aria-disabled={!reportTypeSelected && !compsSelected}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-md transition-all duration-200 ${
                  !reportTypeSelected && !compsSelected
                    ? 'bg-kairos-white-grey text-kairos-charcoal/40 cursor-not-allowed'
                    : 'bg-kairos-soft-black hover:bg-kairos-charcoal text-kairos-chalk hover:shadow-lg'
                }`}
                onClick={() => {
                  // Button does nothing - CMA Generator removed
                }}
              >
                <span className="text-sm font-medium">
                  Generate Reports
                </span>
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
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