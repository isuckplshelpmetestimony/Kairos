import React, { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Property = Record<string, unknown>;

interface DataTableProps {
  open: boolean;
  onClose: () => void;
  properties: Property[];
}

// Minimal, self-contained modal table for viewing raw property rows.
// Closes on ESC and backdrop click. Simple focus trap while open.
export const DataTable: React.FC<DataTableProps> = ({ open, onClose, properties }) => {
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

  if (!open) return null;

  const safe = (v: unknown): string => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'number') return String(v);
    return String(v);
  };

  const formatPrice = (v: unknown): string => {
    const num = Number(v);
    return Number.isFinite(num) && num > 0 ? `₱${Math.round(num).toLocaleString()}` : '';
    };

  // Prepare rows from canonical property shape
  const rows = (properties || []).map((p: Property) => {
    const id = safe(p.property_id);
    const address = safe(p.address);
    const price = formatPrice(p.price);
    const bedrooms = safe(p.bedrooms);
    const bathrooms = safe(p.bathrooms);
    const sqm = safe(p.sqm);
    const coords = Array.isArray(p.coordinates) ? p.coordinates as unknown[] : [];
    const lat = coords.length >= 1 ? safe(coords[0]) : '';
    const lng = coords.length >= 2 ? safe(coords[1]) : '';
    // Try to parse city/province from address (fallbacks: '')
    const parts = address.split(',').map(s => s.trim());
    const city = parts.length >= 2 ? parts[parts.length - 2] : '';
    const province = parts.length >= 1 ? parts[parts.length - 1] : '';
    return { id, address, city, province, bedrooms, bathrooms, sqm, price, lat, lng };
  });

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
        className={`relative z-10 bg-white border border-gray-200 rounded-3xl shadow-sm w-[95vw] max-w-5xl max-h-[85vh] overflow-hidden transform transition-all duration-250 ${entered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-92 translate-y-2'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Property Data</h3>
          <Button ref={closeBtnRef} variant="ghost" size="sm" onClick={onClose} className="text-gray-600 hover:text-gray-900">
            Close
          </Button>
        </div>
        <div className="p-4 overflow-auto max-h-[65vh]">
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-600">
                  <th className="py-2 pr-4">Property ID</th>
                  <th className="py-2 pr-4">Address</th>
                  <th className="py-2 pr-4">City</th>
                  <th className="py-2 pr-4">Province</th>
                  <th className="py-2 pr-4">Bedrooms</th>
                  <th className="py-2 pr-4">Bathrooms</th>
                  <th className="py-2 pr-4">Floor Area</th>
                  <th className="py-2 pr-4">Price</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx} className="border-t border-gray-100 text-sm text-gray-900">
                    <td className="py-2 pr-4 break-words">{r.id}</td>
                    <td className="py-2 pr-4 break-words">{r.address}</td>
                    <td className="py-2 pr-4">{r.city}</td>
                    <td className="py-2 pr-4">{r.province}</td>
                    <td className="py-2 pr-4">{r.bedrooms}</td>
                    <td className="py-2 pr-4">{r.bathrooms}</td>
                    <td className="py-2 pr-4">{r.sqm}</td>
                    <td className="py-2 pr-4">{r.price}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr className="border-t border-gray-100">
                    <td colSpan={10} className="py-8 text-center text-sm text-gray-500">
                      No properties to display
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};


