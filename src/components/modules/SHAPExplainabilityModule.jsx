import React, { useState } from 'react';
import { HelpCircle, BarChart2, PieChart } from 'lucide-react';

const SHAPExplainabilityModule = ({ selectedPolygon }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-purple-400" />
          Model Explainability
        </h1>
        <p className="text-sm text-slate-400 mt-1">SHAP (SHapley Additive exPlanations) visualizations.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 min-h-[150px] flex flex-col items-center justify-center gap-3">
          <BarChart2 className="w-8 h-8 text-slate-600" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Top Features</h3>
          <p className="text-xs text-slate-500 text-center">NDVI, Elevation, and Soil Moisture are the top contributors.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 min-h-[120px] flex flex-col items-center justify-center gap-2">
            <PieChart className="w-6 h-6 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">SHAP Summary</h3>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 min-h-[120px] flex flex-col items-center justify-center gap-2">
            <BarChart2 className="w-6 h-6 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Feature Importance</h3>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 min-h-[150px] flex flex-col items-center justify-center gap-3">
          <HelpCircle className="w-8 h-8 text-slate-600" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Local Explanation</h3>
          <p className="text-xs text-slate-500 text-center max-w-xs">
            For the selected polygon, high NDVI increased the SOC prediction by +12 tC/ha.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SHAPExplainabilityModule;
