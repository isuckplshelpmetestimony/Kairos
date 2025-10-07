import React, { JSX } from 'react';
import { DATE_RANGE_OPTIONS } from '../constants';

// Type definitions for the helper functions
export type PropertyStatus = {
  selected: boolean;
  dateRange: string;
};

export type PropertyStatuses = Record<string, PropertyStatus>;

export type SelectedReports = {
  property: boolean;
  seller: boolean;
  market: boolean;
  neighborhood: boolean;
};

// Helper functions for property status management
export const createPropertyStatusHandlers = (
  propertyStatuses: PropertyStatuses,
  setPropertyStatuses: React.Dispatch<React.SetStateAction<PropertyStatuses>>,
  openCalendarDropdown: string | null,
  setOpenCalendarDropdown: React.Dispatch<React.SetStateAction<string | null>>,
  selectedReports: SelectedReports,
  setSelectedReports: React.Dispatch<React.SetStateAction<SelectedReports>>
) => {
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

  const handleReportToggle = (reportType: keyof SelectedReports) => {
    setSelectedReports(prev => ({ ...prev, [reportType]: !prev[reportType] }));
  };

  return {
    handleDateRangeSelect,
    handleClickOutside,
    handleSelectAll,
    handleSelectNone,
    handleStatusToggle,
    handleReportToggle,
  };
};

// Render property status group component
export const renderPropertyStatusGroup = (
  groupName: string,
  statuses: readonly string[],
  description: string,
  propertyStatuses: PropertyStatuses,
  handleStatusToggle: (status: string, checked: boolean) => void,
  openCalendarDropdown: string | null,
  setOpenCalendarDropdown: React.Dispatch<React.SetStateAction<string | null>>,
  handleDateRangeSelect: (status: string, range: string) => void
): JSX.Element => {
  return (
    <div className="mb-2 first:mt-0 mt-4">
      <div className="text-xs text-[#7A7873] mb-2">
        <strong style={{ fontWeight: 900 }}>{groupName}:</strong>
      </div>
      {statuses.map((status) => {
        const { selected, dateRange } = propertyStatuses[status];
        return (
          <div key={status} className={`flex items-center gap-3 p-2 rounded`}>
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
                className="w-20 pr-7 pl-2 py-1 text-sm border border-[#E5E4E6] rounded bg-white cursor-pointer"
                onClick={() => setOpenCalendarDropdown(openCalendarDropdown === status ? null : status)}
              />
              <div className="absolute right-2 top-0 bottom-0 flex items-center pointer-events-none">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
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
      <p className="text-xs text-[#7A7873] ml-6 mb-6">{description}</p>
    </div>
  );
};
