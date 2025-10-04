import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";

interface HistoricalTrendsProps {
  cma?: { stats: { avg: number; max: number } };
}

export const HistoricalTrends = ({ cma }: HistoricalTrendsProps) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const dataPoints = [450, 465, 470, 472, 478, 485];
  const maxValue = Math.max(...dataPoints);
  const minValue = Math.min(...dataPoints);
  const range = maxValue - minValue;

  const currentAvg = cma ? cma.stats.avg.toLocaleString() : "485,000";
  const peakPrice = cma ? cma.stats.max.toLocaleString() : "485,000";

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

      <p className="text-[10px] text-red-600 mb-4">Mock data placeholder</p>

      <p className="text-sm font-medium text-gray-700">Average Price Over Time (Last 6 Months)</p>
      <div className="relative h-48 mb-8 bg-kairos-white-porcelain rounded-lg p-6">
        <div className="flex items-end justify-between h-full">
          {dataPoints.map((value, idx) => {
            const height = ((value - minValue) / range) * 100;
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
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="text-center">
          <p className="text-2xl font-semibold">₱{currentAvg}</p>
          <p className="text-xs text-muted-foreground mt-1">Current Avg</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-green-600">+8.9%</p>
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


