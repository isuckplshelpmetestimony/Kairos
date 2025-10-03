import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";

interface NeighborhoodsProps {
  cma?: { stats: { avg: number } };
}

export const Neighborhoods = ({ cma }: NeighborhoodsProps) => {
  const basePrice = cma ? cma.stats.avg : 485000;
  const neighborhoods = [
    { name: "Downtown", properties: "156 properties", price: `₱${(basePrice * 1.3).toLocaleString()}`, change: "+3.2%", positive: true },
    { name: "Riverside", properties: "89 properties", price: `₱${(basePrice * 0.7).toLocaleString()}`, change: "+1.8%", positive: true },
    { name: "Hillcrest", properties: "134 properties", price: `₱${(basePrice * 1.5).toLocaleString()}`, change: "+4.1%", positive: true },
    { name: "Oakwood", properties: "78 properties", price: `₱${(basePrice * 0.8).toLocaleString()}`, change: "-0.5%", positive: false },
    { name: "Metro Heights", properties: "112 properties", price: `₱${(basePrice * 1.1).toLocaleString()}`, change: "+2.7%", positive: true },
  ];

  return (
    <Card className="bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Neighborhoods</h3>
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

      <div className="space-y-4">
        {neighborhoods.map((n) => (
          <div key={n.name} className="flex justify-between items-start border-b border-border pb-4 last:border-0">
            <div>
              <p className="font-medium text-sm">{n.name}</p>
              <p className="text-xs text-muted-foreground">{n.properties}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">{n.price}</p>
              <p className={`text-xs ${n.positive ? 'text-green-600' : 'text-red-600'}`}>{n.change}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};


