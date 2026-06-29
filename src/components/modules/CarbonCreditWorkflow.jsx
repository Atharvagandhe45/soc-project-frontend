import React from 'react';
import { ShieldCheck, ArrowRight, FileCheck, Landmark, Leaf } from 'lucide-react';

const CarbonCreditWorkflow = () => {
  const steps = [
    { id: 1, title: 'Farm Boundary', status: 'completed', desc: 'Polygon drawn & saved.' },
    { id: 2, title: 'SOC Prediction', status: 'completed', desc: 'ML models ran successfully.' },
    { id: 3, title: 'Stock Estimation', status: 'completed', desc: 'Total carbon calculated.' },
    { id: 4, title: 'Sequestration Rate', status: 'active', desc: 'Analyzing temporal changes.' },
    { id: 5, title: 'Credit Calculation', status: 'pending', desc: 'Converting tons to credits.' },
    { id: 6, title: 'Verification', status: 'pending', desc: 'Third-party audit review.' },
    { id: 7, title: 'Registry Submission', status: 'pending', desc: 'Minting credits on ledger.' }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          MRV Pipeline
        </h1>
        <p className="text-sm text-slate-400 mt-1">Monitoring, Reporting, and Verification.</p>
      </div>

      <div className="relative border-l-2 border-slate-800 ml-3 pl-6 space-y-6">
        {steps.map((step, index) => {
          let dotColor = 'bg-slate-700 border-slate-800';
          let textColor = 'text-slate-500';
          let descColor = 'text-slate-600';
          
          if (step.status === 'completed') {
            dotColor = 'bg-emerald-500 border-emerald-900';
            textColor = 'text-emerald-400';
            descColor = 'text-emerald-500/60';
          } else if (step.status === 'active') {
            dotColor = 'bg-blue-500 border-blue-900 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
            textColor = 'text-blue-400';
            descColor = 'text-blue-200/70';
          }

          return (
            <div key={step.id} className="relative">
              <div className={`absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 ${dotColor}`} />
              <div>
                <h3 className={`text-sm font-bold ${textColor}`}>{step.title}</h3>
                <p className={`text-xs mt-1 ${descColor}`}>{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="pt-6 border-t border-slate-800">
         <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50 rounded-lg px-4 py-3 text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2">
            Export Audit Report <FileCheck className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
};

export default CarbonCreditWorkflow;
