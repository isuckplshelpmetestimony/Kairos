import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";

interface HistoricalTrendsProps {
  cma?: {
    stats: {
      count: number;
      avg: number;
      median: number;
      min: number;
      max: number;
    };
  };
}

export const HistoricalTrends = ({ cma }: HistoricalTrendsProps) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const dataPoints = [450, 465, 470, 472, 478, 485];
  const maxValue = Math.max(...dataPoints);
  const minValue = Math.min(...dataPoints);
  const range = maxValue - minValue;

  const currentAvg = cma ? (cma.stats.avg / 1000).toFixed(0) : "485";
  const peakPrice = cma ? (cma.stats.max / 1000).toFixed(0) : "485";

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
      <div className="refined-card-header">
        <h3 className="refined-card-title">Historical Trends</h3>
        <div className="refined-card-actions">
          <Button variant="ghost" size="sm" className="refined-card-action">
            <Eye className="h-4 w-4" />
            View
          </Button>
          <Button variant="ghost" size="sm" className="refined-card-action">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <p className="text-[10px] text-red-600 mb-4">Mock data placeholder</p>

      <p className="refined-section-title">Average Price Over Time (Last 6 Months)</p>

      {/* Simple line chart visualization */}
      <div className="relative h-48 mb-8 bg-kairos-white-porcelain rounded-lg p-6">
        <div className="flex items-end justify-between h-full">
          {dataPoints.map((value, idx) => {
            const height = ((value - minValue) / range) * 100;
            return (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div className="w-full flex items-end justify-center h-full">
                  <div
                    className="w-2 bg-blue-500 rounded-t transition-all hover:bg-blue-500/80"
                    style={{ height: `${Math.max(height, 10)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-3">{months[idx]}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-3 gap-6">
        <div className="text-center">
          <p className="text-2xl font-semibold">₱{currentAvg}K</p>
          <p className="text-xs text-muted-foreground mt-1">Current Avg</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-green-600">+8.9%</p>
          <p className="text-xs text-muted-foreground mt-1">6-Month Growth</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold">₱{peakPrice}K</p>
          <p className="text-xs text-muted-foreground mt-1">Peak Price</p>
        </div>
      </div>
    </Card>
  );
};
