import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";

interface PropertyReportProps {
  cma?: {
    stats: { count: number; avg: number; median: number; min: number; max: number };
  };
}

export const PropertyReport = ({ cma }: PropertyReportProps) => {
  const listings = [
    { address: "123 Maple Street", days: "15 days on market", price: cma ? `₱${(cma.stats.avg * 0.8).toLocaleString()}` : "$625,000", status: "Active" },
    { address: "456 Oak Avenue", days: "8 days on market", price: cma ? `₱${(cma.stats.avg * 1.2).toLocaleString()}` : "$750,000", status: "Pending" },
    { address: "789 Pine Road", days: "32 days on market", price: cma ? `₱${cma.stats.median.toLocaleString()}` : "$420,000", status: "Active" },
    { address: "321 Elm Drive", days: "4 days on market", price: cma ? `₱${(cma.stats.avg * 1.5).toLocaleString()}` : "$890,000", status: "Pending" },
    { address: "654 Birch Lane", days: "22 days on market", price: cma ? `₱${(cma.stats.avg * 0.9).toLocaleString()}` : "$536,000", status: "Active" },
  ];

  const statusData = [
    { label: "Active", count: cma ? Math.floor(cma.stats.count * 0.68).toString() : "847" },
    { label: "Pending", count: cma ? Math.floor(cma.stats.count * 0.25).toString() : "312" },
    { label: "Closed", count: cma ? Math.floor(cma.stats.count * 0.07).toString() : "88" },
  ];

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Property Report</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-8 gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <Eye className="h-4 w-4" />
            View
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <p className="text-[10px] text-red-600 mb-4">Mock data placeholder</p>

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-4">Top 5 Listings</p>
        <div className="space-y-3">
          {listings.map((listing, idx) => (
            <div key={idx} className="flex justify-between items-start border-b border-border pb-3 last:border-0">
              <div>
                <p className="font-medium text-sm">{listing.address}</p>
                <p className="text-xs text-muted-foreground">{listing.days}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">{listing.price}</p>
                <p className="text-xs text-green-600">{listing.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-4">Status Breakdown</p>
        <div className="grid grid-cols-3 gap-4">
          {statusData.map((status) => (
            <div key={status.label} className="text-center p-4 bg-kairos-white-porcelain rounded-lg">
              <p className="text-2xl font-semibold mb-1">{status.count}</p>
              <p className="text-xs text-muted-foreground">{status.label}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};


