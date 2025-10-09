import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
import type { ProjectionData } from "@/types/projection";
import { formatProjectionLabel } from "@/types/projection";

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
  
  const maxValue = Math.max(...dataPoints);
  const minValue = Math.min(...dataPoints);
  const range = maxValue - minValue;

  // Calculate 6-month growth percentage
  const firstValue = dataPoints[0];
  const lastValue = dataPoints[dataPoints.length - 1];
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
        <div className="flex gap-2">
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


      <p className="text-sm font-medium text-gray-700">Average Price Over Time (Last 6 Months)</p>
      {dataPoints.length === 6 && (
        <p className="text-xs text-gray-500 mb-2">
          Trend: ₱{dataPoints.map(v => (v/1000000).toFixed(1)).join('M → ')}M
        </p>
      )}
      <div className="relative h-48 mb-8 bg-kairos-white-porcelain rounded-lg p-6">
        {dataPoints.length === 6 ? (
          <div className="w-full h-full">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              {/* Professional smooth curve with color-coded segments */}
              {(() => {
                // Create smooth curve path - only for first 6 data points (Jan-Jun)
                const pathData = dataPoints.map((value, idx) => {
                  const x = 5 + (idx * 7.5); // Start at 5% margin, spread 6 points across 45% of timeline
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
              {dataPoints.slice(0, -1).map((value, idx) => {
                const x1 = 5 + (idx * 7.5); // Start at 5% margin, spread across 45% of timeline
                const y1 = 90 - ((value - minValue) / range) * 80; // Use 80% of height with margins
                const x2 = 5 + ((idx + 1) * 7.5);
                const y2 = 90 - ((dataPoints[idx + 1] - minValue) / range) * 80;
                
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
              {dataPoints.map((value, idx) => {
                const x = 5 + (idx * 7.5); // Start at 5% margin, spread across 45% of timeline
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
            
            {/* Month labels - all 12 months */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-3 pb-2">
              {months.map((month, idx) => (
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


