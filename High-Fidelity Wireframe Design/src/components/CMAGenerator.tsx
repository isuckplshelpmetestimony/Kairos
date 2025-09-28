import React, { useState } from 'react';
import { ArrowLeft, FileText, Home, TrendingUp } from 'lucide-react';

// Kairos CMA Generator – clean component ready for API integration
// Notes:
// - Tailwind-only styling per requirements
// - Kairos colors: #FFFFFC, #F8FBF8, #DCDDDD, #3B3832, inputs #F3F3F2
// - Typography expectations: Futura (headings), Avenir (body) should be provided globally

// Type definitions
interface Property {
  address: string;
  listPrice: string;
  beds: number;
  baths: number;
  sqft: number;
  lot: string;
  yearBuilt: number;
}

interface Comparable {
  address: string;
  price: string;
  beds: number;
  baths: number;
  sqft: number;
  date: string;
  distance: string;
}

interface Analysis {
  pricingTrend: string;
  dom: string;
  recommendation: string;
}

interface Summary {
  suggestedPrice: string;
  rationale: string;
}

interface Document {
  property: Property | null;
  comparables: Comparable[];
  analysis: Analysis | null;
  summary: Summary | null;
}

interface CMAGeneratorProps {
  onBack?: () => void;
}

export default function CMAGenerator({ onBack }: CMAGeneratorProps) {
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [doc] = useState<Document>({
    property: null,
    comparables: [],
    analysis: null,
    summary: null,
  });

  const handleSubmit = async (): Promise<void> => {
    if (!input.trim() || isLoading) return;
    
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const result = await generateCMA(input);
      // setDoc(result);
    } catch {
      // TODO: Add proper error handling
      window.alert('Failed to generate CMA. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerBase = 'bg-kairos-chalk text-kairos-charcoal';
  const panelBase = 'rounded-xl shadow-sm border border-[#DCDDDD]';
  const headingFont = "font-['Futura']";
  const bodyFont = "font-['Avenir']";

  return (
    <div className={`flex flex-col h-screen ${containerBase}`}>
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-[#E5E4E6] bg-kairos-white-porcelain">
        <div className="flex items-center gap-3">
          <button
            aria-label="Back"
            className="p-2 rounded-md hover:bg-[#F3F3F2] border border-transparent hover:border-[#DCDDDD]"
            onClick={() => onBack?.()}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className={`${headingFont} text-lg sm:text-xl`}>CMA Generator</div>
        </div>
        <div className="flex items-center gap-3" />
      </header>

      {/* Main Split */}
      <div className="flex-1 flex flex-row gap-6 px-6 pt-6 pb-0 items-stretch min-h-0 w-full">
        {/* Input Panel – fixed 40% width on desktop */}
        <section className={`${panelBase} overflow-hidden flex-none basis-[40%] h-full flex flex-col`} aria-label="Input Panel">
          <div className="flex-1 flex flex-col">
            <div className={`px-4 py-3 border-b border-[#DCDDDD] ${headingFont} flex items-center gap-2`}>
              <FileText className="w-4 h-4" />
              <span>Property Input</span>
            </div>
            <div className="flex-1 p-4">
              <div className="space-y-4">
                <div>
                  <label className={`${bodyFont} text-sm text-[#3B3832] mb-2 block`}>
                    Property Address
                  </label>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter property address..."
                    className={`${bodyFont} w-full px-3 py-2 text-sm rounded-md border border-[#DCDDDD] bg-[#F3F3F2] outline-none focus:ring-1 focus:ring-[#DCDDDD] focus:border-[#3B3832]`}
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!input.trim() || isLoading}
                  className={`w-full px-4 py-2 rounded-md border ${
                    !input.trim() || isLoading
                      ? 'bg-[#EAEAEA] text-[#9C9C9C] border-[#E0E0E0] cursor-not-allowed'
                      : 'bg-[#DCDDDD] text-[#3B3832] hover:bg-[#cfcfcf] border-[#D0D0D0]'
                  }`}
                >
                  {isLoading ? 'Generating...' : 'Generate CMA'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Document Panel – occupy remaining space */}
        <section className={`${panelBase} overflow-hidden flex-1 min-w-0 h-full flex flex-col`} aria-label="Document Preview">
          <div className="flex-1 flex flex-col">
            <div className={`px-4 py-3 border-b border-[#DCDDDD] ${headingFont} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span>CMA Preview</span>
              </div>
              <button
                className={`${bodyFont} inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-[#E5E4E6] bg-white hover:bg-[#F8FBF8]`}
                disabled={!doc.property}
              >
                <FileText className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Property Details */}
              <div className="bg-white rounded-lg border border-[#E5E4E6] shadow-sm">
                <div className={`px-4 py-3 border-b border-[#DCDDDD] ${headingFont} flex items-center gap-2`}>
                  <FileText className="w-4 h-4" />
                  <span>Property Details</span>
                </div>
                <div className="p-4">
                  {doc.property ? (
                    <div className={`${bodyFont} text-sm grid grid-cols-1 sm:grid-cols-2 gap-3`}>
                      <div><span className="text-[#7A7873]">Address</span><div className="font-medium">{doc.property.address}</div></div>
                      <div><span className="text-[#7A7873]">List Price</span><div className="font-medium">{doc.property.listPrice}</div></div>
                      <div><span className="text-[#7A7873]">Beds</span><div className="font-medium">{doc.property.beds}</div></div>
                      <div><span className="text-[#7A7873]">Baths</span><div className="font-medium">{doc.property.baths}</div></div>
                      <div><span className="text-[#7A7873]">Sq Ft</span><div className="font-medium">{doc.property.sqft}</div></div>
                      <div><span className="text-[#7A7873]">Lot</span><div className="font-medium">{doc.property.lot}</div></div>
                      <div><span className="text-[#7A7873]">Year Built</span><div className="font-medium">{doc.property.yearBuilt}</div></div>
                    </div>
                  ) : (
                    <div className={`${bodyFont} text-sm text-[#7A7873]`}>Enter a property address to begin.</div>
                  )}
                </div>
              </div>

              {/* Comparables */}
              <div className="bg-white rounded-lg border border-[#E5E4E6] shadow-sm">
                <div className={`px-4 py-3 border-b border-[#DCDDDD] ${headingFont} flex items-center gap-2`}>
                  <Home className="w-4 h-4" />
                  <span>Comparables</span>
                </div>
                <div className="p-4">
                  {doc.comparables && doc.comparables.length > 0 ? (
                    <div className="space-y-3">
                      {doc.comparables.map((c, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-md border border-[#DCDDDD] bg-[#FFFFFC]">
                          <div className={`${bodyFont} text-sm`}>
                            <div className="font-medium">{c.address}</div>
                            <div className="text-[#7A7873]">{c.beds} bd • {c.baths} ba • {c.sqft} sqft</div>
                          </div>
                          <div className={`${bodyFont} text-sm flex items-center gap-4`}>
                            <div className="font-semibold">{c.price}</div>
                            <div className="text-[#7A7873]">{c.date}</div>
                            <div className="text-[#7A7873]">{c.distance}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`${bodyFont} text-sm text-[#7A7873]`}>No comparables yet. Generate a CMA to see results.</div>
                  )}
                </div>
              </div>

              {/* Market Analysis */}
              <div className="bg-white rounded-lg border border-[#E5E4E6] shadow-sm">
                <div className={`px-4 py-3 border-b border-[#DCDDDD] ${headingFont} flex items-center gap-2`}>
                  <TrendingUp className="w-4 h-4" />
                  <span>Market Analysis</span>
                </div>
                <div className="p-4">
                  {doc.analysis ? (
                    <div className={`${bodyFont} text-sm grid grid-cols-1 sm:grid-cols-3 gap-4`}>
                      <div>
                        <div className="text-[#7A7873]">Pricing Trend</div>
                        <div className="font-medium">{doc.analysis.pricingTrend}</div>
                      </div>
                      <div>
                        <div className="text-[#7A7873]">Days on Market</div>
                        <div className="font-medium">{doc.analysis.dom}</div>
                      </div>
                      <div>
                        <div className="text-[#7A7873]">Recommendation</div>
                        <div className="font-medium">{doc.analysis.recommendation}</div>
                      </div>
                    </div>
                  ) : (
                    <div className={`${bodyFont} text-sm text-[#7A7873]`}>Generate a CMA to see market analysis.</div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white rounded-lg border border-[#DCDDDD] shadow-sm">
                <div className={`px-4 py-3 border-b border-[#DCDDDD] ${headingFont} flex items-center gap-2`}>
                  <FileText className="w-4 h-4" />
                  <span>Summary</span>
                </div>
                <div className="p-4">
                  {doc.summary ? (
                    <div className={`${bodyFont} text-sm grid grid-cols-1 sm:grid-cols-2 gap-4`}>
                      <div>
                        <div className="text-[#7A7873]">Suggested List Price</div>
                        <div className="text-xl font-semibold">{doc.summary.suggestedPrice}</div>
                      </div>
                      <div>
                        <div className="text-[#7A7873]">Rationale</div>
                        <div className="font-medium">{doc.summary.rationale}</div>
                      </div>
                    </div>
                  ) : (
                    <div className={`${bodyFont} text-sm text-[#7A7873]`}>Generate a CMA to see pricing summary.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}