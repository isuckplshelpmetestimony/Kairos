import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
import { downloadCSV, arrayToCSV } from "@/utils/csvExport";
interface CMASummaryProps {
  cma?: {
    stats: { count: number; avg: number; median: number; min: number; max: number };
  };
  onOpenCMASummary?: () => void;
}

export const CMASummary = ({ cma, onOpenCMASummary }: CMASummaryProps) => {
  const summaryData = [
    { label: "Average", value: cma ? `₱${cma.stats.avg.toLocaleString()}` : "$485,000" },
    { label: "Median", value: cma ? `₱${cma.stats.median.toLocaleString()}` : "$452,000" },
    { label: "Range", value: cma ? `₱${cma.stats.min.toLocaleString()} - ₱${cma.stats.max.toLocaleString()}` : "₱275,000 - ₱890,000" },
  ];

  const handleDownload = () => {
    // Export ALL CMA statistics and additional metrics
    const headers = ['Metric', 'Value', 'Description'];
    const csvData = [
      { 'Metric': 'Total Properties', 'Value': cma?.stats.count || 0, 'Description': 'Total number of properties analyzed' },
      { 'Metric': 'Average List Price', 'Value': cma?.stats.avg || 0, 'Description': 'Average price of all properties' },
      { 'Metric': 'Median List Price', 'Value': cma?.stats.median || 0, 'Description': 'Median price of all properties' },
      { 'Metric': 'Minimum Price', 'Value': cma?.stats.min || 0, 'Description': 'Lowest property price' },
      { 'Metric': 'Maximum Price', 'Value': cma?.stats.max || 0, 'Description': 'Highest property price' },
      { 'Metric': 'Price Range', 'Value': cma ? `${cma.stats.min} - ${cma.stats.max}` : 'N/A', 'Description': 'Price range from min to max' },
    ];
    
    const csvContent = arrayToCSV(csvData, headers);
    downloadCSV(csvContent, 'cma-summary-all.csv');
  };

  return (
    <Card className="bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">CMA Summary</h3>
        <div className="flex gap-1 sm:gap-2">
          <Button 
            onClick={(e) => { 
              e.stopPropagation(); 
              onOpenCMASummary?.(); 
            }}
            variant="ghost" 
            size="sm" 
            className="h-8 sm:h-8 px-2 sm:px-3 gap-1 sm:gap-2 text-gray-600 hover:text-gray-900"
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">View</span>
          </Button>
          <Button 
            onClick={(e) => { 
              e.stopPropagation(); 
              handleDownload(); 
            }}
            variant="ghost" 
            size="sm" 
            className="h-8 sm:h-8 px-2 sm:px-3 gap-1 sm:gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">Download</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {summaryData.map((item) => (
          <div key={item.label} className="flex justify-between items-center border-b border-border pb-3 sm:pb-4 last:border-0">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <div className="text-right">
              <p className="font-semibold text-base sm:text-lg">{item.value}</p>
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


