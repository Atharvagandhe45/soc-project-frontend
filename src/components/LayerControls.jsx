import React from 'react';
import { Layers, Image as ImageIcon, Activity, Droplets } from 'lucide-react';

const LayerControls = ({ activeLayer, setActiveLayer }) => {
  const layers = [
    { id: 'rgb', label: 'RGB Satellite', icon: ImageIcon, color: 'text-slate-300' },
    { id: 'ndvi', label: 'NDVI', icon: LeafIcon, color: 'text-emerald-400' },
    { id: 'savi', label: 'SAVI', icon: Activity, color: 'text-amber-400' },
    { id: 'ndmi', label: 'NDMI', icon: Droplets, color: 'text-cyan-400' },
  ];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 p-2 rounded-2xl shadow-2xl">
      <div className="flex items-center gap-2 px-3 border-r border-slate-700/60">
        <Layers className="w-5 h-5 text-slate-400" />
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider hidden sm:block">Layers</span>
      </div>
      
      <div className="flex items-center gap-1 px-1">
        {layers.map((layer) => {
          const isActive = activeLayer === layer.id;
          const Icon = layer.icon;
          
          return (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                ${isActive 
                  ? 'bg-slate-800 text-white shadow-lg ring-1 ring-slate-600' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? layer.color : 'text-slate-500'}`} />
              <span className="hidden md:block">{layer.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Custom Leaf Icon since lucide-react Leaf is already used for SOC Intelligence
function LeafIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

export default LayerControls;
