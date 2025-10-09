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
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  
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
              <path 
                d={dataPoints.map((value, idx) => {
                  const x = idx * 20; // 0, 20, 40, 60, 80, 100
                  const y = 100 - ((value - minValue) / range) * 100; // Invert Y for SVG
                  return `${idx === 0 ? 'M' : 'L'} ${x},${y}`;
                }).join(' ')}
                stroke="#333f91" 
                strokeWidth="3" 
                fill="none" 
              />
              {/* Add data points for better visibility */}
              {dataPoints.map((value, idx) => {
                const x = idx * 20;
                const y = 100 - ((value - minValue) / range) * 100;
                return (
                  <circle 
                    key={idx}
                    cx={x} 
                    cy={y} 
                    r="2" 
                    fill="#333f91"
                  />
                );
              })}
            </svg>
            
            {/* Month labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-6 pb-2">
              {months.map((month, idx) => (
                <span key={idx} className="text-xs text-muted-foreground">{month}</span>
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


