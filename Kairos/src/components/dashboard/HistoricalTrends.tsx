import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
import type { ProjectionData } from "@/types/projection";
import { formatProjectionLabel } from "@/types/projection";

// ============================================================================
// FEATURE FLAGS
// ============================================================================
// Set to true to enable, false to hide. No code deletion required.
const FEATURE_FLAGS = {
  HISTORICAL_TRENDS_BUTTONS: false, // Enable when needed
};
// ============================================================================

interface HistoricalTrendsProps {
  cma?: { stats: { avg: number; max: number } };
  projection?: ProjectionData | null;
}

export const HistoricalTrends = ({ cma, projection }: HistoricalTrendsProps) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Use projection trend data only (no fallback)
  console.log('HistoricalTrends projection:', projection);
  console.log('trend_6m:', projection?.trend_6m);
  console.log('trend_6m length:', projection?.trend_6m?.length);
  
  const dataPoints = projection && projection.trend_6m.length === 6
    ? projection.trend_6m
    : [];
  
  // Extend Jan–Jun with mock Jul–Sep that connect smoothly from June
  const extendedPoints = (() => {
    if (dataPoints.length !== 6) return [] as number[];
    const june = dataPoints[5];
    const july = Math.round(june * 1.02);     // +2%
    const august = Math.round(july * 1.015);  // +1.5%
    const september = Math.round(august * 0.985); // slight softening
    return [...dataPoints, july, august, september]; // 9 points Jan..Sep
  })();

  // Month index mapping for Jan..Sep
  const monthIndicesJanToSep = [0,1,2,3,4,5,6,7,8];

  // X position across full 12-month axis (5..95)
  const xForMonthIndex = (monthIndex: number) => 5 + (monthIndex * (90 / 11));
  
  const maxValue = Math.max(...extendedPoints);
  const minValue = Math.min(...extendedPoints);
  const range = maxValue - minValue;

  // Calculate 6-month growth percentage
  const firstValue = extendedPoints[0];
  const lastValue = extendedPoints[extendedPoints.length - 1];
  const growthPercent = firstValue > 0 
    ? (((lastValue - firstValue) / firstValue) * 100).toFixed(1)
    : "0.0";
  const isPositiveGrowth = parseFloat(growthPercent) >= 0;

  const currentAvg = cma ? Math.round(cma.stats.avg).toLocaleString() : lastValue.toLocaleString();
  const peakPrice = cma ? Math.round(cma.stats.max).toLocaleString() : maxValue.toLocaleString();

  return (
    <Card className="bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Historical Trends</h3>
        <div className="flex gap-2" style={{ visibility: FEATURE_FLAGS.HISTORICAL_TRENDS_BUTTONS ? 'visible' : 'hidden' }}>
          <Button variant="ghost" size="sm" className="h-8 gap-2 text-gray-600 hover:text-gray-900">
            <Eye className="h-4 w-4" />
            View
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-2 text-gray-600 hover:text-gray-900">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>


      <p className="text-sm font-medium text-gray-700">Average Price Over Time (Jan–Sep)</p>
      {extendedPoints.length === 9 && (
        <p className="text-xs text-gray-500 mb-2">
          Trend: ₱{extendedPoints.map(v => (v/1000000).toFixed(1)).join('M → ')}M
        </p>
      )}
      <div className="relative h-48 mb-8 bg-kairos-white-porcelain rounded-lg p-6">
        {extendedPoints.length === 9 ? (
          <div className="w-full h-full">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              {/* Professional smooth curve with color-coded segments */}
              {(() => {
                // Create smooth curve path across Jan..Sep
                const pathData = extendedPoints.map((value, idx) => {
                  const monthIndex = monthIndicesJanToSep[idx];
                  const x = xForMonthIndex(monthIndex);
                  const y = 90 - ((value - minValue) / range) * 80; // Use 80% of height with 10% margins
                  return `${idx === 0 ? 'M' : 'L'} ${x},${y}`;
                }).join(' ');
                
                return (
                  <path
                    d={pathData}
                    stroke="#e5e7eb"
                    strokeWidth="0.8"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })()}
              
              {/* Color-coded overlay segments */}
              {extendedPoints.slice(0, -1).map((value, idx) => {
                const monthIndex1 = monthIndicesJanToSep[idx];
                const monthIndex2 = monthIndicesJanToSep[idx + 1];
                const x1 = xForMonthIndex(monthIndex1);
                const y1 = 90 - ((value - minValue) / range) * 80; // Use 80% of height with margins
                const x2 = xForMonthIndex(monthIndex2);
                const y2 = 90 - ((extendedPoints[idx + 1] - minValue) / range) * 80;
                
                // Determine color based on Y position
                const avgY = (y1 + y2) / 2;
                let color = "#62bd2d"; // Green for bottom
                if (avgY >= 33 && avgY < 66) {
                  color = "#333f91"; // Blue for middle
                } else if (avgY >= 66) {
                  color = "#e1516c"; // Pink for top
                }
                
                return (
                  <line
                    key={idx}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#000000"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                );
              })}
              
              {/* Professional data points */}
              {extendedPoints.map((value, idx) => {
                const monthIndex = monthIndicesJanToSep[idx];
                const x = xForMonthIndex(monthIndex);
                const y = 90 - ((value - minValue) / range) * 80; // Use 80% of height with margins
                
                // Determine color based on Y position
                let color = "#62bd2d"; // Green for bottom
                if (y >= 33 && y < 66) {
                  color = "#333f91"; // Blue for middle
                } else if (y >= 66) {
                  color = "#e1516c"; // Pink for top
                }
                
                return (
                  <circle 
                    key={idx}
                    cx={x} 
                    cy={y} 
                    r="1.2" 
                    fill="white"
                    stroke="#000000"
                    strokeWidth="0.8"
                  />
                );
              })}
            </svg>
            
            {/* Month labels - only show months with data (Jan-Sep) */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-3 pb-2">
              {months.slice(0, 9).map((month, idx) => (
                <span key={idx} className="text-[10px] text-muted-foreground">{month}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">No projection data available</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="text-center">
          <p className="text-2xl font-semibold">₱{currentAvg}</p>
          <p className="text-xs text-muted-foreground mt-1">Current Avg</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-semibold ${isPositiveGrowth ? 'text-green-600' : 'text-red-600'}`}>
            {isPositiveGrowth ? '+' : ''}{growthPercent}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">6-Month Growth</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold">₱{peakPrice}</p>
          <p className="text-xs text-muted-foreground mt-1">Peak Price</p>
        </div>
      </div>
    </Card>
  );
};


