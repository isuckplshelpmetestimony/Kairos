import React, { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProjectionData } from "@/types/projection";
import { formatProjectionLabel } from "@/types/projection";

interface LocationsTableProps {
  open: boolean;
  onClose: () => void;
  cma: {
    neighborhoods: Record<string, { count: number; mean: number; min: number; max: number }>;
    properties?: Array<Record<string, unknown>>;
  } | null;
  projection?: ProjectionData | null;
}

// Minimal, self-contained modal table for neighborhood data.
// Closes on ESC and backdrop click. Simple focus trap while open.
export const LocationsTable: React.FC<LocationsTableProps> = ({ open, onClose, cma, projection }) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Trigger minimal enter animation on mount
    const raf = requestAnimationFrame(() => setEntered(true));
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        // Very small focus trap: keep focus inside modal
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (document.activeElement === last && !e.shiftKey) {
          e.preventDefault();
          first.focus();
        } else if (document.activeElement === first && e.shiftKey) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    // Move initial focus to close button
    closeBtnRef.current?.focus();
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !cma) return null;

  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || !Number.isFinite(value)) return 'N/A';
    return `₱${Math.round(value).toLocaleString()}`;
  };

  // Calculate price per sq ft for a specific neighborhood
  const calculatePricePerSqFt = (neighborhood: string): number => {
    const properties = cma.properties || [];
    const neighborhoodProps = properties.filter(p => {
      const price = Number(p.price);
      const sqm = Number(p.sqm);
      return p.neighborhood === neighborhood && Number.isFinite(price) && price > 0 && Number.isFinite(sqm) && sqm > 0;
    });
    
    if (neighborhoodProps.length === 0) return 0;
    
    const avgPricePerSqFt = neighborhoodProps.reduce((sum, p) => {
      return sum + (Number(p.price) / Number(p.sqm));
    }, 0) / neighborhoodProps.length;
    
    return avgPricePerSqFt;
  };

  // Build table rows from neighborhoods data (show ALL neighborhoods)
  // Note: Projections are province-level, so we apply them uniformly to all neighborhoods
  const avgSoldPriceMultiplier = projection 
    ? (projection.avg_sold_price / projection.trend_6m[projection.trend_6m.length - 1] || 1)
    : 0;
  const defaultDom = projection ? Math.round(projection.avg_dom) : undefined;

  const rows = Object.entries(cma.neighborhoods)
    .sort(([,a], [,b]) => b.count - a.count) // Sort by count descending
    .map(([name, data]) => ({
      neighborhood: name,
      activeListings: data.count,
      avgListPrice: data.mean,
      avgSoldPrice: data.mean * avgSoldPriceMultiplier, // Use projection ratio if available
      avgPricePerSqFt: calculatePricePerSqFt(name),
      avgDaysOnMarket: defaultDom, // Use projection DOM if available
    }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`absolute inset-0 bg-black/30 transition-opacity duration-250 ${entered ? 'opacity-100' : 'opacity-0'}`} />
      <Card
        ref={modalRef}
        className={`relative z-10 bg-white border border-gray-200 rounded-3xl shadow-sm w-[95vw] max-w-5xl max-h-[85vh] overflow-hidden transform transition-all duration-250 ${entered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Locations</h3>
          <Button ref={closeBtnRef} variant="ghost" size="sm" onClick={onClose} className="text-gray-600 hover:text-gray-900">
            Close
          </Button>
        </div>
        <div className="p-6 overflow-auto max-h-[70vh]">
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-600 border-b border-gray-200">
                  <th className="py-3 pr-4 font-semibold">Neighborhood</th>
                  <th className="py-3 pr-4 font-semibold text-center">Active Listings</th>
                  <th className="py-3 pr-4 font-semibold text-right">Avg List Price (₱)</th>
                  <th className="py-3 pr-4 font-semibold text-right">Avg Sold Price (₱)</th>
                  <th className="py-3 pr-4 font-semibold text-right">Avg Price/Sq Ft</th>
                  <th className="py-3 font-semibold text-center">Avg Days on Market</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 pr-4 text-sm text-gray-900">{row.neighborhood}</td>
                    <td className="py-3 pr-4 text-sm text-center text-gray-900">{row.activeListings}</td>
                    <td className="py-3 pr-4 text-sm text-right text-gray-900">{formatCurrency(row.avgListPrice)}</td>
                    <td className="py-3 pr-4 text-right">
                      <div className="text-sm text-gray-900">{formatCurrency(row.avgSoldPrice)}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{formatProjectionLabel(projection)}</div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-right text-gray-900">{formatCurrency(row.avgPricePerSqFt)}</td>
                    <td className="py-3 text-center">
                      <div className="text-sm text-gray-900">{row.avgDaysOnMarket !== undefined ? row.avgDaysOnMarket : 'N/A'}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{formatProjectionLabel(projection)}</div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr className="border-t border-gray-100">
                    <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                      No neighborhoods to display
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Purpose section */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Purpose:</p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Highlights micro-market variations within different areas</li>
              <li>• Helps buyers and sellers understand location-driven pricing differences</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

