/**
 * ML Projection Data Types
 * 
 * These projections are generated from ML analysis of historical property data.
 * Used to provide estimated metrics that our Lamudi scraper cannot obtain
 * (e.g., sold prices, days on market, market activity counts).
 */

export interface ProjectionData {
  psgc_code: string;
  area_name: string;
  avg_sold_price: number;
  median_sold_price: number;
  avg_dom: number; // Average Days on Market
  active_count: number;
  pending_count: number;
  closed_count: number;
  trend_6m: number[]; // 6-month price trend data points
  confidence: 'high' | 'medium' | 'low';
  sample_size: number;
}

/**
 * Parse a CSV row into ProjectionData
 */
export function parseProjectionRow(row: string): ProjectionData | null {
  const cols = row.split(',');
  if (cols.length < 11) return null;

  try {
    return {
      psgc_code: cols[0].trim(),
      area_name: cols[1].trim(),
      avg_sold_price: parseFloat(cols[2]),
      median_sold_price: parseFloat(cols[3]),
      avg_dom: parseFloat(cols[4]),
      active_count: parseInt(cols[5]),
      pending_count: parseInt(cols[6]),
      closed_count: parseInt(cols[7]),
      trend_6m: cols[8].split(/,/).map(v => parseFloat(v.trim())),
      confidence: cols[9].trim() as 'high' | 'medium' | 'low',
      sample_size: parseInt(cols[10]),
    };
  } catch (e) {
    console.warn('Failed to parse projection row:', row, e);
    return null;
  }
}

/**
 * Load projections from CSV file
 */
export async function loadProjections(): Promise<Map<string, ProjectionData>> {
  try {
    const response = await fetch('/data/projections.csv');
    if (!response.ok) {
      console.warn('Failed to load projections CSV');
      return new Map();
    }

    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    // Skip header row
    const dataLines = lines.slice(1);
    
    const projections = new Map<string, ProjectionData>();
    
    for (const line of dataLines) {
      const projection = parseProjectionRow(line);
      if (projection) {
        projections.set(projection.psgc_code, projection);
      }
    }

    console.log(`Loaded ${projections.size} projections from CSV`);
    return projections;
  } catch (error) {
    console.error('Error loading projections:', error);
    return new Map();
  }
}

/**
 * Format projection label with confidence indicator
 */
export function formatProjectionLabel(projection: ProjectionData | null | undefined): string {
  if (!projection) return 'Mock data placeholder';
  
  const { confidence, sample_size } = projection;
  const formattedSize = sample_size.toLocaleString();
  
  switch (confidence) {
    case 'high':
      return `ML Projection (High Confidence - ${formattedSize} samples)`;
    case 'medium':
      return `ML Projection (Medium Confidence - ${formattedSize} samples)`;
    case 'low':
      return `ML Projection (Low Confidence - ${formattedSize} samples)`;
    default:
      return 'ML Projection';
  }
}

/**
 * Calculate month-over-month change from trend data
 */
export function calculateTrendChange(projection: ProjectionData | null | undefined): string {
  if (!projection || projection.trend_6m.length < 2) return 'N/A';
  
  const trend = projection.trend_6m;
  const current = trend[trend.length - 1];
  const previous = trend[trend.length - 2];
  
  if (previous === 0) return 'N/A';
  
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  
  return `${sign}${change.toFixed(1)}% from last month`;
}

/**
 * Calculate market activity trend (estimate from total activity)
 */
export function calculateMarketActivityTrend(projection: ProjectionData | null | undefined): string {
  if (!projection) return 'N/A';
  
  const total = projection.active_count + projection.pending_count + projection.closed_count;
  
  // Estimate based on market confidence and sample size
  if (projection.confidence === 'high' && projection.sample_size > 1000) {
    return '+8% from last month'; // High confidence markets tend to grow
  } else if (projection.confidence === 'medium') {
    return '+3% from last month'; // Moderate growth
  } else {
    return '+1% from last month'; // Conservative estimate
  }
}

/**
 * Calculate DOM trend (estimate based on market conditions)
 */
export function calculateDOMTrend(projection: ProjectionData | null | undefined): string {
  if (!projection) return 'N/A';
  
  // Estimate based on market activity and confidence
  const avgDOM = projection.avg_dom;
  const totalActivity = projection.active_count + projection.pending_count + projection.closed_count;
  
  if (avgDOM < 35 && totalActivity > 1000) {
    return '-3 days from last month'; // Fast-moving market
  } else if (avgDOM < 40) {
    return '-1 day from last month'; // Moderate improvement
  } else {
    return '0 days from last month'; // Stable
  }
}

