import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";

interface CMASummaryProps {
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

export const CMASummary = ({ cma }: CMASummaryProps) => {
  const summaryData = [
    { 
      label: "Average", 
      value: cma ? `₱${cma.stats.avg.toLocaleString()}` : "$485,000", 
      change: "+2.3%", 
      positive: true 
    },
    { 
      label: "Median", 
      value: cma ? `₱${cma.stats.median.toLocaleString()}` : "$452,000", 
      change: "+1.8%", 
      positive: true 
    },
    { 
      label: "Range", 
      value: cma ? `₱${(cma.stats.min / 1000).toFixed(0)}K - ₱${(cma.stats.max / 1000).toFixed(0)}K` : "$275K - $890K", 
      change: "+6%", 
      positive: true 
    },
  ];

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
      <div className="refined-card-header">
        <h3 className="refined-card-title">CMA Summary</h3>
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

      <div className="space-y-6">
        {summaryData.map((item) => (
          <div key={item.label} className="flex justify-between items-center border-b border-border pb-4 last:border-0">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <div className="text-right">
              <p className="font-semibold text-lg">{item.value}</p>
              <p className={`text-xs ${item.positive ? 'text-green-600' : 'text-red-600'}`}>
                {item.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Comparative Market Analysis based on similar properties within 1 mile radius, last 90 days.
        </p>
      </div>
    </Card>
  );
};
