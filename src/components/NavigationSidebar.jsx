import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Satellite, 
  Leaf, 
  Wind, 
  BadgeDollarSign, 
  FileText, 
  Settings,
  Globe
} from 'lucide-react';

const NavigationSidebar = ({ activeModule, setActiveModule }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'farm_boundaries', label: 'Farm Boundaries', icon: Map },
    { id: 'satellite_analytics', label: 'Satellite Analytics', icon: Satellite },
    { id: 'soc_intelligence', label: 'SOC Intelligence', icon: Leaf },
    { id: 'carbon_sequestration', label: 'Carbon Sequestration', icon: Wind },
    { id: 'carbon_credits', label: 'Carbon Credits', icon: BadgeDollarSign },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-16 lg:w-64 bg-slate-950/90 backdrop-blur-2xl border-r border-slate-800/60 flex flex-col z-20 h-full shadow-[4px_0_24px_rgba(0,0,0,0.5)] transition-all duration-300">
      
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800/60">
        <Globe className="w-8 h-8 text-emerald-400 shrink-0" />
        <div className="ml-3 hidden lg:block">
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 leading-tight">
            SOC Prediction
          </h1>
          <p className="text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase">Intelligence Platform</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {navItems.map((item) => {
          const isActive = activeModule === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`
                flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }
              `}
              title={item.label}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-400 rounded-r-full" />
              )}
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="hidden lg:block text-sm font-semibold tracking-wide whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer Profile/Status */}
      <div className="p-4 border-t border-slate-800/60 flex items-center justify-center lg:justify-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold text-sm shrink-0 shadow-lg shadow-emerald-500/20">
          SP
        </div>
        <div className="hidden lg:block">
          <p className="text-sm font-semibold text-slate-200">System Admin</p>
          <p className="text-xs text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
          </p>
        </div>
      </div>
    </div>
  );
};

export default NavigationSidebar;
