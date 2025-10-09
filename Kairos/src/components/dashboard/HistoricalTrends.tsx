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

      <p className="text-[10px] text-red-600 mb-4">{formatProjectionLabel(projection)}</p>

      <p className="text-sm font-medium text-gray-700">Average Price Over Time (Last 6 Months)</p>
      <div className="relative h-48 mb-8 bg-kairos-white-porcelain rounded-lg p-6">
        {dataPoints.length === 6 ? (
          <div className="flex items-end justify-between h-full">
            {dataPoints.map((value, idx) => {
              const height = range > 0 ? ((value - minValue) / range) * 100 : 50;
              return (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div className="w-full flex items-end justify-center h-full">
                    <div className="w-2 bg-[#333f91] rounded-t transition-all" style={{ height: `${Math.max(height, 10)}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">{months[idx]}</p>
                </div>
              );
            })}
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


