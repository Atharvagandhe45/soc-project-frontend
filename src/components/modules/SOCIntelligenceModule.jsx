import React, { useState } from 'react';
import { Leaf, Cpu, Database, Network } from 'lucide-react';
import { predictSOC } from '../../services/api';
import toast from 'react-hot-toast';

const SOCIntelligenceModule = ({ selectedPolygon }) => {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const handlePredict = async () => {
    if (!selectedPolygon) return;
    setLoading(true);
    try {
      const result = await predictSOC({
        polygon: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [selectedPolygon.coordinates]
          }
        },
        date: new Date().toISOString().split('T')[0]
      });
      setPrediction(result);
      toast.success("Prediction complete!");
    } catch (e) {
      toast.error("Prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-amber-400 flex items-center gap-2">
          <Leaf className="w-6 h-6 text-emerald-400" />
          SOC Intelligence
        </h1>
        <p className="text-sm text-slate-400 mt-1">Machine Learning models for Soil Organic Carbon prediction.</p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
        <div className="bg-amber-500/20 p-2 rounded-lg">
          <Cpu className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-400">Current Status: Coming Soon</h3>
          <p className="text-xs text-amber-200/70 mt-1">
            The SOC prediction architecture is implemented. Awaiting final Random Forest, XGBoost, and Deep Learning model weights.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Model Architecture</h2>
        
        <div className="grid grid-cols-1 gap-3">
          <ModelCard title="Random Forest Ensemble" icon={Network} active={true} desc="Baseline tree-based model. High explainability." />
          <ModelCard title="XGBoost SOC Model" icon={Database} active={false} desc="Gradient boosted trees for non-linear feature interactions." />
          <ModelCard title="Deep Learning (CNN)" icon={Cpu} active={false} desc="Spatial feature extraction from multi-spectral imagery." />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <button 
          onClick={handlePredict}
          disabled={!selectedPolygon || loading}
          className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-emerald-400 border border-slate-700/50 rounded-lg px-4 py-3 text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? 'Running ML Model...' : 'Run SOC Prediction (Mock)'}
        </button>
      </div>

      {prediction && (
        <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Prediction Results</h3>
          <div className="flex justify-between items-end">
            <div>
              <span className="text-3xl font-light text-emerald-400">{prediction.soc_stock}</span>
              <span className="text-sm text-slate-500 ml-1">tC/ha</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] text-slate-500 uppercase">Confidence</span>
              <span className="text-sm font-bold text-cyan-400">{(prediction.confidence * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function ModelCard({ title, icon: Icon, active, desc }) {
  return (
    <div className={`border rounded-xl p-4 flex gap-4 items-center transition-all ${active ? 'bg-slate-900/80 border-emerald-500/50' : 'bg-slate-900/30 border-slate-800 opacity-60'}`}>
      <div className={`p-2 rounded-lg ${active ? 'bg-emerald-500/20' : 'bg-slate-800'}`}>
        <Icon className={`w-5 h-5 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
      </div>
      <div>
        <h4 className={`text-sm font-bold ${active ? 'text-slate-200' : 'text-slate-400'}`}>{title}</h4>
        <p className="text-xs text-slate-500 mt-1">{desc}</p>
      </div>
    </div>
  );
}

export default SOCIntelligenceModule;
