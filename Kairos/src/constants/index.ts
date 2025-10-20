// Constants for Kairos application

export const DATE_RANGE_OPTIONS = [
  { label: 'Last 30 days', value: '0-30' },
  { label: 'Last 60 days', value: '0-60' },
  { label: 'Last 90 days', value: '0-90' },
  { label: 'Last 180 days', value: '0-180' },
] as const;

export const PROPERTY_TYPES = [
  { value: '', label: 'Choose property type...' },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
] as const;

export const LOCATIONS = [
  { value: '', label: 'Choose location...' },
  { value: 'house-lot', label: 'house & lot' },
  { value: 'condo', label: 'condo' },
  { value: 'townhouse', label: 'townhouse' },
  { value: 'lot-only', label: 'lot only' },
] as const;

export const PROPERTY_STATUS_GROUPS = {
  activeMarket: ['Coming Soon', 'Active', 'Active Under Contract'],
  recentActivity: ['Temporary Off Market', 'Pending'],
  historicalSales: ['Closed'],
  other: ['Withdrawn', 'Expired', 'Canceled'],
} as const;

export const INITIAL_PROPERTY_STATUSES = {
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
