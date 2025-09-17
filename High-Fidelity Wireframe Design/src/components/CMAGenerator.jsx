/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Send, FileText, Home, TrendingUp } from 'lucide-react';

// Kairos CMA Generator – split layout (chat left, document right)
// Notes:
// - Tailwind-only styling per requirements
// - Kairos colors: #FFFFFC, #F8FBF8, #DCDDDD, #3B3832, inputs #F3F3F2
// - Typography expectations: Futura (headings), Avenir (body) should be provided globally

const BRAND = {
  chalk: '#FFFFFC',
  mist: '#F8FBF8',
  grey: '#DCDDDD',
  charcoal: '#3B3832',
  input: '#F3F3F2',
};

const MOCK_STEPS = [
  {
    user: '123 Main St, Springfield, list price around $850k',
    ai: 'Got it. I will start your CMA with the property details and location context.',
    update: (doc) => ({
      ...doc,
      property: {
        address: '123 Main St, Springfield',
        listPrice: '$850,000',
        beds: 4,
        baths: 3,
        sqft: 2450,
        lot: '7,800 sqft',
        yearBuilt: 1998,
      },
    }),
  },
  {
    user: 'Focus on comps within 0.5 miles, last 180 days',
    ai: 'Understood. Filtering comparables within 0.5 miles and last 180 days.',
    update: (doc) => ({
      ...doc,
      comparables: [
        { address: '117 Oak Ave', price: '$830,000', beds: 4, baths: 3, sqft: 2380, date: '2025-06-22', distance: '0.3 mi' },
        { address: '89 Pine Ct', price: '$865,000', beds: 4, baths: 3, sqft: 2520, date: '2025-05-09', distance: '0.4 mi' },
        { address: '14 Cedar Ln', price: '$812,000', beds: 3, baths: 3, sqft: 2310, date: '2025-04-15', distance: '0.5 mi' },
      ],
    }),
  },
  {
    user: 'Emphasize pricing trends and days on market',
    ai: 'Adding market trend analysis with pricing and DOM insights.',
    update: (doc) => ({
      ...doc,
      analysis: {
        pricingTrend: 'Stable to slightly upward (+1.8% QoQ) in the submarket.',
        dom: 'Median 18 days (last 90 days).',
        recommendation: 'List at $845,000–$865,000 to position competitively given size and recency.',
      },
    }),
  },
  {
    user: 'Great. Draft final summary and suggested list price.',
    ai: 'Here is the summary and suggested list price based on comps and trends.',
    update: (doc) => ({
      ...doc,
      summary: {
        suggestedPrice: '$855,000',
        rationale: 'Aligned with recent comps, home condition, and slight upward trend.',
      },
    }),
  },
];

function sanitizeInput(value) {
  return String(value || '').slice(0, 500);
}

export default function CMAGenerator({ onBack }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Welcome to Kairos CMA Generator. Provide a target property to begin.' },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  // Desktop-first: always show split. Mobile behavior deferred per request.

  const [doc, setDoc] = useState({
    property: null,
    comparables: [],
    analysis: null,
    summary: null,
  });

  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const canAdvance = useMemo(() => stepIndex < MOCK_STEPS.length, [stepIndex]);

  const handleSend = () => {
    if (isSending) return;
    const clean = sanitizeInput(input);
    if (!clean) return;
    setMessages((prev) => [...prev, { role: 'user', text: clean }]);
    setInput('');
    setIsSending(true);

    // Simulate AI delay 1–2s
    const delay = 900 + Math.floor(Math.random() * 900);
    setTimeout(() => {
      if (canAdvance) {
        const step = MOCK_STEPS[stepIndex];
        // If user input roughly matches expected instruction, proceed, otherwise still proceed
        const updated = step.update(doc);
        setDoc(updated);
        setMessages((prev) => [...prev, { role: 'ai', text: step.ai }]);
        setStepIndex((i) => i + 1);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'ai', text: 'The CMA draft is complete. You can refine any section or export.' },
        ]);
      }
      setIsSending(false);
    }, delay);
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
        {/* Chat Panel – fixed 40% width on desktop */}
        <section className={`${panelBase} overflow-hidden flex-none basis-[40%] h-full flex flex-col`} aria-label="Chat Panel">
          <div className="flex-1 flex flex-col">
            <div className={`px-4 py-3 border-b border-[#DCDDDD] ${headingFont} flex items-center gap-2`}>
              <FileText className="w-4 h-4" />
              <span>Conversation</span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m, idx) => (
                <div key={idx} className={`max-w-[85%] ${m.role === 'ai' ? '' : 'ml-auto'}`}>
                  <div
                    className={`${bodyFont} text-sm px-3 py-2 rounded-lg border ${
                      m.role === 'ai' ? 'bg-white border-[#DCDDDD]' : 'bg-[#F3F3F2] border-[#DCDDDD]'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="max-w-[60%]">
                  <div className={`${bodyFont} text-sm px-3 py-2 rounded-lg border bg-white border-[#DCDDDD] text-[#7A7873]`}>
                    Typing...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="sticky bottom-0 p-3 border-t border-[#DCDDDD] bg-[#F8FBF8]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(sanitizeInput(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend();
                  }}
                  placeholder={canAdvance ? 'Type your next instruction...' : 'CMA ready. Refine or export.'}
                  autoFocus
                  className={`${bodyFont} flex-1 px-3 py-2 text-sm rounded-md border border-[#DCDDDD] bg-[#F3F3F2] outline-none focus:ring-1 focus:ring-[#DCDDDD] focus:border-[#3B3832]`}
                />
                <button
                  disabled={isSending || !input}
                  onClick={handleSend}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border ${
                    isSending || !input
                      ? 'bg-[#EAEAEA] text-[#9C9C9C] border-[#E0E0E0] cursor-not-allowed'
                      : 'bg-[#DCDDDD] text-[#3B3832] hover:bg-[#cfcfcf] border-[#D0D0D0]'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span className="text-sm">Send</span>
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
                <span>Live CMA Preview</span>
              </div>
              <a
                href={"./Sample Full Report.pdf"}
                target="_blank"
                rel="noreferrer"
                className={`${bodyFont} inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-[#E5E4E6] bg-white hover:bg-[#F8FBF8]`}
                aria-label="Export CMA (opens sample full report PDF)"
              >
                <FileText className="w-4 h-4" />
                <span>Export</span>
              </a>
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
                    <div className={`${bodyFont} text-sm text-[#7A7873]`}>Provide a property to begin.</div>
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
                  {doc.comparables && doc.comparables.length ? (
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
                    <div className={`${bodyFont} text-sm text-[#7A7873]`}>No comparables yet. Specify radius and timeframe.</div>
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
                    <div className={`${bodyFont} text-sm text-[#7A7873]`}>Ask for pricing trends to populate analysis.</div>
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
                    <div className={`${bodyFont} text-sm text-[#7A7873]`}>Provide a final instruction to generate a summary.</div>
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


