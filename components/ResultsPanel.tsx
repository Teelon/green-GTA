
import React, { useMemo } from "react";
import { Leaf, Car, Clock, ExternalLink, Bus, Info } from "lucide-react";
import { CommuteData, UserSettings } from "../types";
import { calculateFinancials, calculateEmissions } from "../utils/calculator";

interface ResultsPanelProps {
  commuteData: CommuteData | null;
  settings: UserSettings;
  rawMapResponse: string;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ commuteData, settings, rawMapResponse }) => {
  
  const stats = useMemo(() => {
    if (!commuteData) return null;
    return {
      financials: calculateFinancials(commuteData, settings),
      emissions: calculateEmissions(commuteData, settings)
    };
  }, [commuteData, settings]);

  if (!commuteData || !stats) {
    return (
      <div className="lg:col-span-8 h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 border-dashed p-8 text-center">
        <div className="bg-emerald-50 p-4 rounded-full mb-4">
          <Leaf className="w-10 h-10 text-emerald-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">Ready to calculate your savings?</h3>
        <p className="text-slate-500 max-w-md mt-2">
          Enter your commute details on the left to see how much you could save by switching to GO Transit or other public transportation options.
        </p>
      </div>
    );
  }

  const { financials, emissions } = stats;

  return (
    <div className="lg:col-span-8 space-y-6">
      {/* Route Summary Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Route Analysis</h3>
            <p className="text-sm text-slate-600 mb-4">{rawMapResponse}</p>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {commuteData.sourceUrls.map((url, idx) => (
                <a 
                  key={idx}
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  View on Google Maps <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              ))}
            </div>
          </div>
          
          <div className="flex flex-row md:flex-col gap-4 min-w-[200px]">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center text-slate-500 text-xs uppercase font-bold mb-1">
                <Car className="w-3 h-3 mr-1" /> Driving Distance
              </div>
              <div className="text-xl font-bold text-slate-900">{commuteData.distanceKm} km</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center text-slate-500 text-xs uppercase font-bold mb-1">
                <Clock className="w-3 h-3 mr-1" /> Driving Time
              </div>
              <div className="text-xl font-bold text-slate-900">{Math.round(commuteData.drivingTimeMins)} mins</div>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Highlight */}
      <div className={`rounded-xl shadow-sm border p-8 text-center transition-colors ${financials.savingsYearly > 0 ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-orange-500 border-orange-600 text-white'}`}>
          <h3 className="text-lg font-medium opacity-90 mb-1">
            {financials.savingsYearly > 0 ? "Potential Annual Savings" : "Annual Cost Increase"}
          </h3>
          <div className="text-5xl font-bold tracking-tight mb-2">
            ${Math.abs(financials.savingsYearly).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <p className="text-sm opacity-80">
            {financials.savingsYearly > 0 
              ? "By switching to GO Transit, you could save heavily on gas, maintenance, and parking." 
              : "Driving appears to be cheaper for this specific route based on your inputs."}
          </p>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-500 uppercase mb-4">Daily Cost</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 flex items-center"><Car className="w-4 h-4 mr-2"/> Driving</span>
              <span className="font-bold text-slate-900">${financials.dailyDrivingTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 flex items-center"><Bus className="w-4 h-4 mr-2"/> Transit</span>
                <span className="font-bold text-emerald-600">${financials.dailyTransitTotal.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Savings</span>
                <span className={`font-bold ${financials.savingsDaily > 0 ? 'text-emerald-600' : 'text-orange-500'}`}>
                  ${financials.savingsDaily.toFixed(2)}
                </span>
            </div>
          </div>
        </div>

        {/* Monthly */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-500 uppercase mb-4">Monthly Cost (20 Days)</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Driving</span>
              <span className="font-bold text-slate-900">${(financials.dailyDrivingTotal * 20).toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Transit</span>
                <span className="font-bold text-emerald-600">${(financials.dailyTransitTotal * 20).toFixed(0)}</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Savings</span>
                <span className={`font-bold ${financials.savingsMonthly > 0 ? 'text-emerald-600' : 'text-orange-500'}`}>
                  ${financials.savingsMonthly.toFixed(0)}
                </span>
            </div>
          </div>
        </div>

        {/* Environmental */}
        <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 shadow-sm">
          <h4 className="text-sm font-semibold text-emerald-800 uppercase mb-4">Env. Impact (Yearly)</h4>
          <div className="space-y-4">
              <div className="flex items-center text-emerald-900">
                <Leaf className="w-8 h-8 mr-3 text-emerald-600" />
                <div>
                  <div className="text-2xl font-bold">{Math.max(0, emissions.co2SavedKg).toFixed(0)} kg</div>
                  <div className="text-xs text-emerald-700">CO2 Emissions Avoided</div>
                </div>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                That's equivalent to planting approximately <span className="font-bold">{emissions.treesEquivalent} trees</span> this year!
              </p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-slate-100 rounded-lg p-4 text-xs text-slate-500 flex items-start">
        <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
        <p>
          Estimates based on provided fuel economy, current average gas prices in GTA, and standard maintenance wear-and-tear guidelines. 
          Traffic data provided by Google Maps. Transit times are estimates and may vary by connection.
        </p>
      </div>
    </div>
  );
};
