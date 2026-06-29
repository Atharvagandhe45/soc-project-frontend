import React from 'react';
import { Activity, Droplets, Leaf, Maximize, Target, Calendar } from 'lucide-react';
import { calculatePolygonMetrics } from '../../utils/polygonUtils';

const SatelliteAnalyticsModule = ({ selectedPolygon }) => {
  if (!selectedPolygon) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-500">
        <SatelliteIcon className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-lg font-semibold text-slate-300">No Farm Selected</h2>
        <p className="text-sm text-center mt-2 max-w-xs">
          Select a farm boundary from the map to view its satellite analytics and vegetation health indices.
        </p>
      </div>
    );
  }

  const metrics = calculatePolygonMetrics(selectedPolygon.coordinates);

  const cards = [
    { title: 'Vegetation Health', value: 'Optimal', icon: Leaf, color: 'text-emerald-400' },
    { title: 'Average NDVI', value: '0.72', icon: Activity, color: 'text-emerald-400' },
    { title: 'Average SAVI', value: '0.45', icon: Activity, color: 'text-amber-400' },
    { title: 'Average NDMI', value: '0.61', icon: Droplets, color: 'text-cyan-400' },
    { title: 'Farm Area', value: `${(metrics.area / 10000).toFixed(2)} ha`, icon: Maximize, color: 'text-purple-400' },
    { title: 'Farm Perimeter', value: `${metrics.perimeter.toFixed(2)} m`, icon: Maximize, color: 'text-purple-400' },
    { title: 'Detection Confidence', value: `${(selectedPolygon.confidence * 100).toFixed(1)}%`, icon: Target, color: 'text-blue-400' },
    { title: 'Last Analysis Date', value: new Date().toLocaleDateString(), icon: Calendar, color: 'text-slate-400' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
          Vegetation Health Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">Satellite derived indices for {selectedPolygon.name || 'selected farm'}.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${card.color}`} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
              </div>
              <span className={`text-xl font-light ${card.color}`}>{card.value}</span>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4">
         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Layer Controls Hint</h3>
         <p className="text-sm text-slate-500">
            Use the bottom toolbar to toggle between RGB Satellite imagery, NDVI, SAVI, and NDMI layers. 
         </p>
      </div>
    </div>
  );
};

function SatelliteIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 7 9 3 5 7l4 4"/>
      <path d="m17 11 4 4-4 4-4-4"/>
      <path d="m8 12 4 4 6-6-4-4Z"/>
      <path d="m16 8 3-3"/>
      <path d="M9 21a6 6 0 0 0-6-6"/>
    </svg>
  );
}

export default SatelliteAnalyticsModule;
