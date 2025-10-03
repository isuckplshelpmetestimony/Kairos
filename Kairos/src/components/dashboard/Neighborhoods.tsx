import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";

interface NeighborhoodsProps {
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
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
      <div className="refined-card-header">
        <h3 className="refined-card-title">Neighborhoods</h3>
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

      <div className="space-y-4">
        {neighborhoods.map((neighborhood) => (
          <div key={neighborhood.name} className="flex justify-between items-start border-b border-border pb-4 last:border-0">
            <div>
              <p className="font-medium text-sm">{neighborhood.name}</p>
              <p className="text-xs text-muted-foreground">{neighborhood.properties}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">{neighborhood.price}</p>
              <p className={`text-xs ${neighborhood.positive ? 'text-green-600' : 'text-red-600'}`}>
                {neighborhood.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Average prices and trends over the last 30 days by neighborhood.
        </p>
      </div>
    </Card>
  );
};
