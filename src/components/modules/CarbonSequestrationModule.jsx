import React from 'react';
import { Wind, TrendingUp, BadgeDollarSign } from 'lucide-react';
import { calculatePolygonMetrics } from '../../utils/polygonUtils';

const CarbonSequestrationModule = ({ selectedPolygon }) => {
  if (!selectedPolygon) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-500">
        <Wind className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-lg font-semibold text-slate-300">No Farm Selected</h2>
        <p className="text-sm text-center mt-2 max-w-xs">
          Select a farm boundary to view its Carbon Sequestration metrics.
        </p>
      </div>
    );
  }

  const metrics = calculatePolygonMetrics(selectedPolygon.coordinates);
  const areaHa = metrics.area / 10000;
  
  // Mock calculations
  const carbonStored = (areaHa * 125.4).toFixed(1);
  const sequesteredPerYear = (areaHa * 2.3).toFixed(2);
  const stockChange = "+1.8%";
  const estimatedCredits = Math.floor(areaHa * 2.3 * 1.5); // 1.5 credits per ton of sequestered carbon

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center gap-2">
          <Wind className="w-6 h-6 text-blue-400" />
          Carbon Sequestration
        </h1>
        <p className="text-sm text-slate-400 mt-1">Analysis for {selectedPolygon.name || 'selected farm'}.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-900/50 border border-blue-500/30 rounded-xl p-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
             Total Carbon Stored
          </span>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-light text-cyan-400">{carbonStored}</span>
            <span className="text-sm text-slate-500 mb-1">tCO₂e</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-400" /> Sequestered/Yr</span>
            <span className="text-xl font-light text-emerald-400">{sequesteredPerYear} <span className="text-xs text-slate-500">t/yr</span></span>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><TrendingUp className="w-3 h-3 text-blue-400" /> Stock Change</span>
            <span className="text-xl font-light text-blue-400">{stockChange}</span>
          </div>
        </div>

        <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-5 mt-4">
          <span className="text-xs font-bold text-emerald-500/70 uppercase tracking-widest flex items-center gap-2 mb-2">
             <BadgeDollarSign className="w-4 h-4 text-emerald-500" /> Estimated Credits
          </span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-emerald-400">{estimatedCredits}</span>
            <span className="text-sm text-slate-500 mb-1">Credits / Year</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonSequestrationModule;
