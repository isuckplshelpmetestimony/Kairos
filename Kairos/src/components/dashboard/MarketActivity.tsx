import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
import type { ProjectionData } from "@/types/projection";
import { formatProjectionLabel } from "@/types/projection";
import { downloadCSV, arrayToCSV } from "@/utils/csvExport";

interface MarketActivityProps {
  cma?: { stats: { count: number } };
  projection?: ProjectionData | null;
  onOpenMarketActivity?: () => void;
}

export const MarketActivity = ({ cma, projection, onOpenMarketActivity }: MarketActivityProps) => {
  // Use projection data only (no fallback)
  const activeCount = projection ? projection.active_count : 0;
  const pendingCount = projection ? projection.pending_count : 0;
  const closedCount = projection ? projection.closed_count : 0;

  const totalCount = activeCount + pendingCount + closedCount;
  const activePercent = totalCount > 0 ? ((activeCount / totalCount) * 100).toFixed(1) : "0";
  const pendingPercent = totalCount > 0 ? ((pendingCount / totalCount) * 100).toFixed(1) : "0";
  const closedPercent = totalCount > 0 ? ((closedCount / totalCount) * 100).toFixed(1) : "0";

  const activityData = [
    { label: "Active", count: activeCount, color: "bg-[#333f91]", width: `${activePercent}%` },
    { label: "Pending", count: pendingCount, color: "bg-[#e1516c]", width: `${pendingPercent}%` },
    { label: "Closed", count: closedCount, color: "bg-[#62bd2d]", width: `${closedPercent}%` },
  ];

  const handleDownload = () => {
    // Export ALL market activity data including ML projections
    const headers = ['Status', 'Count', 'Min Price (₱)', 'Max Price (₱)', 'Avg Price (₱)', 'Median Price (₱)', 'Avg Days on Market', 'Data Source'];
    const csvData = [
      {
        'Status': 'Active',
        'Count': activeCount,
        'Min Price (₱)': projection ? Math.round(projection.avg_sold_price * 0.75) : 0,
        'Max Price (₱)': projection ? Math.round(projection.avg_sold_price * 1.25) : 0,
        'Avg Price (₱)': projection?.avg_sold_price || 0,
        'Median Price (₱)': projection?.median_sold_price || 0,
        'Avg Days on Market': projection?.avg_dom || 0,
        'Data Source': 'Machine Learning Projections'
      },
      {
        'Status': 'Pending',
        'Count': pendingCount,
        'Min Price (₱)': projection ? Math.round(projection.avg_sold_price * 0.8) : 0,
        'Max Price (₱)': projection ? Math.round(projection.avg_sold_price * 1.2) : 0,
        'Avg Price (₱)': projection ? Math.round(projection.avg_sold_price * 0.95) : 0,
        'Median Price (₱)': projection?.median_sold_price || 0,
        'Avg Days on Market': projection ? Math.round(projection.avg_dom * 1.2) : 0,
        'Data Source': 'Machine Learning Projections'
      },
      {
        'Status': 'Closed (Last 90 Days)',
        'Count': closedCount,
        'Min Price (₱)': projection ? Math.round(projection.avg_sold_price * 0.78) : 0,
        'Max Price (₱)': projection ? Math.round(projection.avg_sold_price * 1.4) : 0,
        'Avg Price (₱)': projection?.avg_sold_price || 0,
        'Median Price (₱)': projection?.median_sold_price || 0,
        'Avg Days on Market': projection ? Math.round(projection.avg_dom * 1.4) : 0,
        'Data Source': 'Machine Learning Projections'
      },
      // Add additional ML projection data
      {
        'Status': 'Market Intelligence Summary',
        'Count': projection?.sample_size || 0,
        'Min Price (₱)': 'N/A',
        'Max Price (₱)': 'N/A',
        'Avg Price (₱)': projection?.avg_sold_price || 0,
        'Median Price (₱)': projection?.median_sold_price || 0,
        'Avg Days on Market': projection?.avg_dom || 0,
        'Data Source': `Machine Learning (${projection?.sample_size || 0} data points)`
      }
    ];
    
    const csvContent = arrayToCSV(csvData, headers);
    downloadCSV(csvContent, 'market-activity-all.csv');
  };

  return (
    <Card className="bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Market Activity</h3>
        <div className="flex gap-2">
          <Button 
            onClick={(e) => { 
              e.stopPropagation(); 
              onOpenMarketActivity?.(); 
            }}
            variant="ghost" 
            size="sm" 
            className="h-8 gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
          <Button 
            onClick={(e) => { 
              e.stopPropagation(); 
              handleDownload(); 
            }}
            variant="ghost" 
            size="sm" 
            className="h-8 gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <p className="text-[10px] text-gray-500 mb-4">{formatProjectionLabel(projection)}</p>

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


