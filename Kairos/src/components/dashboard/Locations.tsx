import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
import type { ProjectionData } from "@/types/projection";
import { calculateTrendChange } from "@/types/projection";

interface NeighborhoodsProps {
  cma?: { 
    stats: { avg: number };
    neighborhoods: Record<string, { count: number; mean: number; min: number; max: number }>;
  };
  onOpenLocations?: () => void;
  projection?: ProjectionData | null;
}

export const Neighborhoods = ({ cma, onOpenLocations, projection }: NeighborhoodsProps) => {
  // Use real data from API if available, otherwise fallback to mock data
  const neighborhoods = cma?.neighborhoods ? 
    Object.entries(cma.neighborhoods)
      .sort(([,a], [,b]) => b.count - a.count) // Sort by count (most results first)
      .slice(0, 5) // Take top 5
      .map(([name, data]) => ({
        name,
        properties: `${data.count} properties`,
        price: `₱${Math.round(data.mean).toLocaleString()}`,
        change: calculateTrendChange(projection), // Use province-level trend as neighborhood estimate
        positive: true
      })) : [
      { name: "Downtown", properties: "156 properties", price: "₱485,000", change: "N/A", positive: true },
      { name: "Riverside", properties: "89 properties", price: "₱485,000", change: "N/A", positive: true },
      { name: "Hillcrest", properties: "134 properties", price: "₱485,000", change: "N/A", positive: true },
      { name: "Oakwood", properties: "78 properties", price: "₱485,000", change: "N/A", positive: true },
      { name: "Metro Heights", properties: "112 properties", price: "₱485,000", change: "N/A", positive: true },
    ];

  return (
    <Card className="bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Locations</h3>
        <div className="flex gap-2">
          <Button 
            onClick={(e) => { 
              e.stopPropagation(); 
              onOpenLocations?.(); 
            }}
            variant="ghost" 
            size="sm" 
            className="h-8 gap-2 text-gray-600 hover:text-gray-900"
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-2 text-gray-600 hover:text-gray-900">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>


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


