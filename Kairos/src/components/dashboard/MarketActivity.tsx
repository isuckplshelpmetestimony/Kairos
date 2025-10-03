import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";

interface MarketActivityProps {
  cma?: { stats: { count: number } };
}

export const MarketActivity = ({ cma }: MarketActivityProps) => {
  const totalCount = cma ? cma.stats.count : 1247;
  const activeCount = Math.floor(totalCount * 0.68);
  const pendingCount = Math.floor(totalCount * 0.25);
  const closedCount = Math.floor(totalCount * 0.07);

  const activityData = [
    { label: "Active", count: activeCount, color: "bg-[#333f91]", width: "68%" },
    { label: "Pending", count: pendingCount, color: "bg-[#e1516c]", width: "25%" },
    { label: "Closed", count: closedCount, color: "bg-[#62bd2d]", width: "7%" },
  ];

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Market Activity</h3>
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

      <div className="space-y-6">
        {activityData.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="font-semibold">{item.count}</p>
            </div>
            <div className="w-full bg-kairos-white-porcelain rounded-full h-2">
              <div className={`h-2 rounded-full transition-all ${item.color}`} style={{ width: item.width }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};


