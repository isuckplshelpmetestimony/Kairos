import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
interface NeighborhoodsProps {
  cma?: { 
    stats: { avg: number };
    neighborhoods: Record<string, { count: number; mean: number; min: number; max: number }>;
  };
  onOpenLocations?: () => void;
}

export const Neighborhoods = ({ cma, onOpenLocations }: NeighborhoodsProps) => {
  // Use real data from API if available, otherwise fallback to mock data
  const neighborhoods = cma?.neighborhoods ? 
    Object.entries(cma.neighborhoods)
      .sort(([,a], [,b]) => b.count - a.count) // Sort by count (most results first)
      .slice(0, 5) // Take top 5
      .map(([name, data]) => ({
        name,
        properties: `${data.count} properties`,
        price: `₱${Math.round(data.mean).toLocaleString()}`
      })) : [
      { name: "Downtown", properties: "156 properties", price: "₱485,000" },
      { name: "Riverside", properties: "89 properties", price: "₱485,000" },
      { name: "Hillcrest", properties: "134 properties", price: "₱485,000" },
      { name: "Oakwood", properties: "78 properties", price: "₱485,000" },
      { name: "Metro Heights", properties: "112 properties", price: "₱485,000" },
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
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};


