import { KairosLogo } from './components/KairosLogo';
import { InlineToggle } from './components/InlineToggle';
import { useState } from 'react';

export default function App() {
  const [reportTypeSelected, setReportTypeSelected] = useState(true);
  const [compsSelected, setCompsSelected] = useState(false);

  return (
    <div className="min-h-screen bg-kairos-chalk">
      {/* Header with Logo */}
      <header className="w-full py-6 px-8">
        <KairosLogo />
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-8 py-16 max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-kairos-charcoal mb-6 leading-tight">
            Generate Comparative Market Analysis and Pricing Reports in minutes
          </h1>
          <p className="text-lg md:text-xl text-kairos-charcoal/70 leading-relaxed max-w-2xl mx-auto">
            Streamline your property analysis workflow with AI-powered insights and comprehensive market data. 
            Perfect for real estate professionals who need accurate, reliable reporting tools.
          </p>
        </div>

        {/* Input Interface with Inline Toggles */}
        <div className="w-full max-w-2xl">
          <div className="relative bg-kairos-white-porcelain border-2 border-kairos-white-grey rounded-2xl shadow-sm focus-within:border-kairos-charcoal transition-colors duration-200 pb-4">
            <input
              type="text"
              placeholder="Enter property address..."
              className="w-full h-16 px-6 pr-32 text-lg bg-transparent border-none outline-none placeholder:text-kairos-charcoal/40"
            />
            
            {/* Toggle Buttons at Bottom */}
            <div className="px-6 flex gap-2">
              <InlineToggle
                label="Report Type"
                isSelected={reportTypeSelected}
                onToggle={() => {
                  setReportTypeSelected(true);
                  setCompsSelected(false);
                }}
              />
              <InlineToggle
                label="Comps"
                isSelected={compsSelected}
                onToggle={() => {
                  setCompsSelected(true);
                  setReportTypeSelected(false);
                }}
              />
            </div>
            
            {/* Prominent Search Button */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <button className="flex items-center gap-2 px-4 py-2 bg-kairos-soft-black hover:bg-kairos-charcoal text-kairos-chalk rounded-xl shadow-md transition-all duration-200 hover:shadow-lg">
                <span className="text-sm font-medium">
                  Search
                </span>
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Grid Background Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02] z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #2C2C2C 1px, transparent 1px),
            linear-gradient(to bottom, #2C2C2C 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
}