import React, { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CMASummaryTableProps {
  open: boolean;
  onClose: () => void;
  cma: {
    stats: { count: number; avg: number; median: number; min: number; max: number };
    properties?: Array<{ price: number; sqm: number; [key: string]: unknown }>;
  } | null;
}

// Minimal, self-contained modal table for CMA summary metrics.
// Closes on ESC and backdrop click. Simple focus trap while open.
export const CMASummaryTable: React.FC<CMASummaryTableProps> = ({ open, onClose, cma }) => {
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

  // Calculate price per sq m from properties
  const validProperties = (cma.properties || []).filter(p => {
    const price = Number(p.price);
    const sqm = Number(p.sqm);
    return price > 0 && sqm > 0;
  });
  
  const pricePerSqm = validProperties.length > 0
    ? validProperties.reduce((sum, p) => sum + (Number(p.price) / Number(p.sqm)), 0) / validProperties.length
    : 0;

  // Mock calculations for sold prices (real data not available yet)
  const avgSoldPrice = cma.stats.avg * 0.98; // Approximation: sold ≈ 98% of list
  const medianSoldPrice = cma.stats.median * 0.99; // Approximation
  const avgDaysOnMarket = 42; // Mock constant

  const metrics = [
    { label: 'Total Properties Analyzed', value: cma.stats.count.toString(), isMock: false },
    { label: 'Average List Price', value: formatCurrency(cma.stats.avg), isMock: false },
    { label: 'Median List Price', value: formatCurrency(cma.stats.median), isMock: false },
    { label: 'Average Sold Price', value: formatCurrency(avgSoldPrice), isMock: true },
    { label: 'Median Sold Price', value: formatCurrency(medianSoldPrice), isMock: true },
    { label: 'Average Days on Market', value: avgDaysOnMarket.toString(), isMock: true },
    { label: 'Price per Sq M (Avg)', value: formatCurrency(pricePerSqm), isMock: false },
  ];

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
        className={`relative z-10 bg-white border border-gray-200 rounded-3xl shadow-sm w-[95vw] max-w-3xl max-h-[85vh] overflow-hidden transform transition-all duration-250 ${entered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">CMA Summary</h3>
          <Button ref={closeBtnRef} variant="ghost" size="sm" onClick={onClose} className="text-gray-600 hover:text-gray-900">
            Close
          </Button>
        </div>
        <div className="p-6 overflow-auto max-h-[70vh]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-600 border-b border-gray-200">
                  <th className="py-3 pr-4 font-semibold">Metric</th>
                  <th className="py-3 text-right font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, idx) => (
                  <tr key={idx} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 pr-4 text-sm text-gray-900">{metric.label}</td>
                    <td className="py-3 text-right">
                      <div className="text-sm font-semibold text-gray-900">{metric.value}</div>
                      {metric.isMock && (
                        <div className="text-xs text-red-500 mt-0.5">Mock data placeholder</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Purpose section */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Purpose:</p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Provides at-a-glance insights for decision-making</li>
              <li>• Useful for realtors when explaining pricing strategy to clients</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

