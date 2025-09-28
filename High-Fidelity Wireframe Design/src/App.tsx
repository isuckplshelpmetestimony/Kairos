import React, { useState } from 'react';
import { KairosLogo } from './components/KairosLogo';
import { InlineToggle } from './components/InlineToggle';
import CMAGenerator from './components/CMAGenerator';

export default function App() {
  const [reportTypeSelected, setReportTypeSelected] = useState(true);
  const [compsSelected, setCompsSelected] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isComparisonsOpen, setIsComparisonsOpen] = useState(false);
  const [showCMA, setShowCMA] = useState(false);
  const [selectedReports, setSelectedReports] = useState({
    property: true,
    seller: true,
    market: true,
    neighborhood: true,
  });
  const [propertyStatuses, setPropertyStatuses] = useState<Record<string, { selected: boolean; dateRange: string }>>({
    'Coming Soon': { selected: false, dateRange: '0-90' },
    'Active': { selected: true, dateRange: '0-90' },
    'Active Under Contract': { selected: true, dateRange: '0-90' },
    'Temporary Off Market': { selected: true, dateRange: '0-90' },
    'Pending': { selected: true, dateRange: '0-90' },
    'Withdrawn': { selected: false, dateRange: '0-90' },
    'Closed': { selected: true, dateRange: '0-180' },
    'Expired': { selected: false, dateRange: '0-90' },
    'Canceled': { selected: false, dateRange: '0-90' },
  });
  const [openCalendarDropdown, setOpenCalendarDropdown] = useState<string | null>(null);

  const dateRangeOptions = [
    { label: 'Last 30 days', value: '0-30' },
    { label: 'Last 60 days', value: '0-60' },
    { label: 'Last 90 days', value: '0-90' },
    { label: 'Last 180 days', value: '0-180' },
  ];

  const handleDateRangeSelect = (status: string, range: string) => {
    setPropertyStatuses(prev => ({
      ...prev,
      [status]: { ...prev[status], dateRange: range }
    }));
    setOpenCalendarDropdown(null);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (openCalendarDropdown && !(e.target as HTMLElement).closest('.calendar-dropdown')) {
      setOpenCalendarDropdown(null);
    }
  };

  if (showCMA) {
    return <CMAGenerator onBack={() => setShowCMA(false)} />;
  }

  return (
    <div className="min-h-screen bg-kairos-chalk" onClick={handleClickOutside}>
      {/* Header with Logo */}
      <header className="w-full py-6 px-8">
        <KairosLogo iconSize="xl" labelSize="xl" />
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-8 py-16 max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-kairos-charcoal mb-6 leading-tight">
            Generate Comparative Market Analysis and Pricing Reports in <em className="italic">minutes</em>
          </h1>
          <p className="text-lg md:text-xl text-kairos-charcoal/70 leading-relaxed max-w-2xl mx-auto">
            Streamline your property analysis workflow with AI-powered insights and comprehensive market data. 
            Perfect for real estate professionals who need accurate, reliable reporting tools.
          </p>
        </div>

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
                    <option value="">Choose property type...</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="land">Land</option>
                  </select>
                </div>
                
                {/* Location Section */}
                <div className="p-4 border-b border-[#E5E4E6]">
                  <label className="font-['Futura'] text-sm text-[#3B3832] mb-2 block">
                    Select Location
                  </label>
                  <select className="w-full p-2 border border-[#E5E4E6] rounded bg-[#F3F3F2]">
                    <option value="">Choose location...</option>
                    <option value="downtown">Downtown</option>
                    <option value="suburbs">Suburbs</option>
                    <option value="waterfront">Waterfront</option>
                  </select>
                </div>
                
                {/* Results Section */}
                <div className="flex justify-between items-center px-4 pt-4 no-bottom-padding">
                  <div className="flex gap-4">
                    <button 
                      className="text-sm text-[#3B3832] hover:underline"
                      onClick={() => {
                        const newStatuses = { ...propertyStatuses };
                        Object.keys(newStatuses).forEach(key => {
                          newStatuses[key].selected = true;
                        });
                        setPropertyStatuses(newStatuses);
                      }}
                    >
                      Select All
                    </button>
                    <button 
                      className="text-sm text-[#3B3832] hover:underline"
                      onClick={() => {
                        const newStatuses = { ...propertyStatuses };
                        Object.keys(newStatuses).forEach(key => {
                          newStatuses[key].selected = false;
                        });
                        setPropertyStatuses(newStatuses);
                      }}
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
                  {/* Status List */}
                  <div className="px-4 py-2 space-y-1">
                    {/* Active Market Data Section */}
                    <div className="mb-2">
                      <div className="text-xs text-[#7A7873] mb-2">
                        <strong style={{ fontWeight: 900 }}>Active Market Data:</strong>
                      </div>
                      {Object.entries(propertyStatuses).filter(([status]) => 
                        ['Coming Soon', 'Active', 'Active Under Contract'].includes(status)
                      ).map(([status, statusData]) => {
                        const { selected, dateRange } = statusData as { selected: boolean; dateRange: string };
                        return (
                        <div key={status} className={`flex items-center gap-3 p-2 rounded ${selected ? 'bg-blue-50' : ''}`}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => {
                              setPropertyStatuses(prev => ({
                                ...prev,
                                [status]: { ...prev[status], selected: e.target.checked }
                              }));
                            }}
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
                            
                            {/* Date Range Dropdown */}
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
                                {dateRangeOptions.map((option) => (
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
                      <p className="text-xs text-[#7A7873] ml-6 description-spacing">shows current market conditions and pricing trends</p>
                    </div>

                    {/* Recent Market Activity Section */}
                    <div className="mb-2 section-header-spacing">
                      <div className="text-xs text-[#7A7873] mb-2">
                        <strong style={{ fontWeight: 900 }}>Recent Market Activity:</strong>
                      </div>
                      {Object.entries(propertyStatuses).filter(([status]) => 
                        ['Temporary Off Market', 'Pending'].includes(status)
                      ).map(([status, statusData]) => {
                        const { selected, dateRange } = statusData as { selected: boolean; dateRange: string };
                        return (
                        <div key={status} className={`flex items-center gap-3 p-2 rounded ${selected ? 'bg-blue-50' : ''}`}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => {
                              setPropertyStatuses(prev => ({
                                ...prev,
                                [status]: { ...prev[status], selected: e.target.checked }
                              }));
                            }}
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
                            
                            {/* Date Range Dropdown */}
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
                                {dateRangeOptions.map((option) => (
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
                      <p className="text-xs text-[#7A7873] ml-6 description-spacing">indicates recent market activity</p>
                    </div>


                    {/* Historical Sales Data Section */}
                    <div className="mb-2 section-header-spacing">
                      <div className="text-xs text-[#7A7873] mb-2">
                        <strong style={{ fontWeight: 900 }}>Historical Sales Data:</strong>
                      </div>
                      {Object.entries(propertyStatuses).filter(([status]) => 
                        ['Closed'].includes(status)
                      ).map(([status, statusData]) => {
                        const { selected, dateRange } = statusData as { selected: boolean; dateRange: string };
                        return (
                        <div key={status} className={`flex items-center gap-3 p-2 rounded ${selected ? 'bg-blue-50' : ''}`}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => {
                              setPropertyStatuses(prev => ({
                                ...prev,
                                [status]: { ...prev[status], selected: e.target.checked }
                              }));
                            }}
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
                            
                            {/* Date Range Dropdown */}
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
                                {dateRangeOptions.map((option) => (
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
                    </div>

                            {/* Other Statuses */}
                            {Object.entries(propertyStatuses).filter(([status]) => 
                              !['Coming Soon', 'Active', 'Active Under Contract', 'Temporary Off Market', 'Pending', 'Closed'].includes(status)
                            ).map(([status, statusData]) => {
                              const { selected, dateRange } = statusData as { selected: boolean; dateRange: string };
                              return (
                              <div key={status} className={`flex items-center gap-3 p-2 rounded ${selected ? 'bg-blue-50' : ''}`}>
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={(e) => {
                                    setPropertyStatuses(prev => ({
                                      ...prev,
                                      [status]: { ...prev[status], selected: e.target.checked }
                                    }));
                                  }}
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
                                  
                                  {/* Date Range Dropdown */}
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
                                      {dateRangeOptions.map((option) => (
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
                            <p className="text-xs text-[#7A7873] ml-6 description-spacing">provides completed transaction data for comparison</p>
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
                  if (reportTypeSelected || compsSelected) {
                    setShowCMA(true);
                  }
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
                <div className="w-full p-4 hover:bg-[#E7E7EB] border-b border-[#E5E4E6] flex items-center justify-between text-left">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedReports.property}
                      onChange={(e) =>
                        setSelectedReports((prev) => ({ ...prev, property: e.target.checked }))
                      }
                      aria-label="Select Property Report"
                      className="w-4 h-4 rounded border-[#E5E4E6]"
                      style={{ accentColor: '#E5FFCC' }}
                    />
                    <span className="font-['Futura']">Property Report</span>
                  </div>
                  <a
                    href={"./Sample Property Report.pdf"}
                    target="_blank"
                    rel="noreferrer"
                    className="font-['Avenir'] text-sm text-[#7A7873] hover:text-kairos-charcoal hover:underline underline-offset-2"
                  >
                    View sample here
                  </a>
                </div>
                <div className="w-full p-4 hover:bg-[#E7E7EB] border-b border-[#E5E4E6] flex items-center justify-between text-left">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedReports.seller}
                      onChange={(e) =>
                        setSelectedReports((prev) => ({ ...prev, seller: e.target.checked }))
                      }
                      aria-label="Select Seller's Report"
                      className="w-4 h-4 rounded border-[#E5E4E6]"
                      style={{ accentColor: '#E5FFCC' }}
                    />
                    <span className="font-['Futura']">Seller's Report</span>
                  </div>
                  <a
                    href={"./Sample Seller’s Report.pdf"}
                    target="_blank"
                    rel="noreferrer"
                    className="font-['Avenir'] text-sm text-[#7A7873] hover:text-kairos-charcoal hover:underline underline-offset-2"
                  >
                    View sample here
                  </a>
                </div>
                <div className="w-full p-4 hover:bg-[#E7E7EB] border-b border-[#E5E4E6] flex items-center justify-between text-left">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedReports.market}
                      onChange={(e) =>
                        setSelectedReports((prev) => ({ ...prev, market: e.target.checked }))
                      }
                      aria-label="Select Market Activity Report"
                      className="w-4 h-4 rounded border-[#E5E4E6]"
                      style={{ accentColor: '#E5FFCC' }}
                    />
                    <span className="font-['Futura']">Market Activity Report</span>
                  </div>
                  <a
                    href={"./Sample Market Activity Report.pdf"}
                    target="_blank"
                    rel="noreferrer"
                    className="font-['Avenir'] text-sm text-[#7A7873] hover:text-kairos-charcoal hover:underline underline-offset-2"
                  >
                    View sample here
                  </a>
                </div>
                <div className="w-full p-4 hover:bg-[#E7E7EB] flex items-center justify-between text-left">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedReports.neighborhood}
                      onChange={(e) =>
                        setSelectedReports((prev) => ({ ...prev, neighborhood: e.target.checked }))
                      }
                      aria-label="Select Neighborhood Report"
                      className="w-4 h-4 rounded border-[#E5E4E6]"
                      style={{ accentColor: '#E5FFCC' }}
                    />
                    <span className="font-['Futura']">Neighborhood Report</span>
                  </div>
                  <a
                    href={"./Sample Neighborhood Report.pdf"}
                    target="_blank"
                    rel="noreferrer"
                    className="font-['Avenir'] text-sm text-[#7A7873] hover:text-kairos-charcoal hover:underline underline-offset-2"
                  >
                    View sample here
                  </a>
                </div>
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