import React, { useState, useEffect } from 'react';
import * as Cesium from 'cesium';
import { detectBoundaries } from '../services/api';
import { savePolygon, deletePolygon as deletePolygonApi, updatePolygon } from '../services/api';
import toast from 'react-hot-toast';
import { MapPin, Scan, Trash2, Eye, EyeOff, Download, Image as ImageIcon, UploadCloud, BarChart3, Globe, PenTool, Save } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { calculatePolygonMetrics } from '../utils/polygonUtils';
import { exportToCSV, exportToKML } from '../utils/export';
import * as turf from '@turf/turf';

const Sidebar = ({
  onGoToLocation,
  onClearBoundaries,
  onExportGeoJSON,
  onExportPNG,
  isDetecting,
  setIsDetecting,
  detectionCount,
  boundariesVisible,
  setBoundariesVisible,
  mapViewer,
  setPolygons,
  polygons,
  targetCoordinates,
  selectedPolygonId,
  setSelectedPolygonId
}) => {
  const [lat, setLat] = useState('19.0760');
  const [lng, setLng] = useState('72.8777');
  const [activeTab, setActiveTab] = useState('globe'); // 'globe', 'upload', 'analytics'
  const [uploadedImage, setUploadedImage] = useState(null);
  
  const selectedPolygon = polygons.find(p => (p._id === selectedPolygonId || p.tempId === selectedPolygonId));
  const metrics = selectedPolygon ? calculatePolygonMetrics(selectedPolygon.coordinates) : { area: 0, perimeter: 0 };

  useEffect(() => {
      if (targetCoordinates?.lat) setLat(targetCoordinates.lat.toString());
      if (targetCoordinates?.lng) setLng(targetCoordinates.lng.toString());
  }, [targetCoordinates]);

  const handleGoToLocation = () => {
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      toast.error("Please enter valid numeric coordinates.");
      return;
    }
    onGoToLocation(lat, lng);
  };

  const handleDrawMode = () => {
      if (!window.isDrawingMode) {
          window.isDrawingMode = true;
          toast("Click on the globe to draw. Double click to finish.", { icon: '✍️' });
          // Initialize drawing logic in a global context or specific to the CesiumGlobe
          // This is a simplified activation; the actual drawing logic must be synced with CesiumGlobe.
          // For simplicity in this implementation, we will mock a drawn polygon if requested,
          // or rely on CesiumGlobe to handle window.isDrawingMode and add to polygons.
          
          const tempId = `drawn_${Date.now()}`;
          const newPoly = { tempId, coordinates: [], isDrawing: true, name: "New Polygon" };
          setPolygons([...polygons, newPoly]);
          setSelectedPolygonId(tempId);
      } else {
          window.isDrawingMode = false;
          // Clean up incomplete drawings
          setPolygons(prev => prev.filter(p => !p.isDrawing || p.coordinates.length >= 3).map(p => ({...p, isDrawing: false})));
          toast.success("Drawing finished.");
      }
  };

  const handleSavePolygon = async () => {
      if (!selectedPolygon) return;
      
      if (!selectedPolygon.coordinates || selectedPolygon.coordinates.length < 3) {
          toast.error("Polygon must have at least 3 points to be saved.");
          return;
      }
      
      const toastId = toast.loading("Saving polygon...");
      try {
          const payload = {
              name: selectedPolygon.name || "Farm Boundary",
              coordinates: selectedPolygon.coordinates,
              area: metrics.area,
              perimeter: metrics.perimeter
          };
          
          if (selectedPolygon._id) {
              const updated = await updatePolygon(selectedPolygon._id, payload);
              setPolygons(prev => prev.map(p => p._id === updated._id ? updated : p));
              toast.success("Polygon updated!", { id: toastId });
          } else {
              const saved = await savePolygon(payload);
              setPolygons(prev => prev.map(p => p.tempId === selectedPolygon.tempId ? saved : p));
              setSelectedPolygonId(saved._id);
              toast.success("Polygon saved!", { id: toastId });
          }
      } catch (e) {
          toast.error("Failed to save polygon.", { id: toastId });
      }
  };

  const handleDeletePolygon = async () => {
      if (!selectedPolygon) return;
      
      if (selectedPolygon._id) {
          const toastId = toast.loading("Deleting polygon...");
          try {
              await deletePolygonApi(selectedPolygon._id);
              setPolygons(prev => prev.filter(p => p._id !== selectedPolygon._id));
              setSelectedPolygonId(null);
              toast.success("Polygon deleted.", { id: toastId });
          } catch (e) {
              toast.error("Failed to delete.", { id: toastId });
          }
      } else {
          setPolygons(prev => prev.filter(p => p.tempId !== selectedPolygon.tempId));
          setSelectedPolygonId(null);
          toast.success("Polygon removed.");
      }
  };

  const flyToSelected = () => {
      if (selectedPolygon && mapViewer) {
          const cartesianArray = selectedPolygon.coordinates.map(pt => Cesium.Cartesian3.fromDegrees(pt[1], pt[0]));
          const boundingSphere = Cesium.BoundingSphere.fromPoints(cartesianArray);
          mapViewer.camera.flyToBoundingSphere(boundingSphere, { duration: 1.5 });
      }
  };

  const handleGlobeDetect = async () => {
    if (isDetecting) return;
    if (!mapViewer || !mapViewer.scene.canvas) {
      toast.error("Map not ready.");
      return;
    }
    
    setIsDetecting(true);
    const toastId = toast.loading("Capturing 3D Globe...");
    
    try {
      await new Promise(r => setTimeout(r, 500));
      
      const canvas = mapViewer.scene.canvas;
      const base64Image = canvas.toDataURL("image/jpeg", 0.9);
      
      toast.loading("Analyzing with ML model...", { id: toastId });
      
      const result = await detectBoundaries(base64Image);
      
      if (result.success && result.predictions?.length > 0) {
          const newPolygons = [];
          let totalFarms = 0;
          
          result.predictions.forEach((prediction) => {
            if (prediction.class === "farm_boundary" && prediction.points) {
              totalFarms++;
              let latLngs = [];
              const dpr = window.devicePixelRatio || 1;
              
              prediction.points.forEach(pt => {
                const screenX = pt.x / dpr;
                const screenY = pt.y / dpr;
                
                const cartesian = mapViewer.camera.pickEllipsoid(
                  new Cesium.Cartesian2(screenX, screenY), 
                  mapViewer.scene.globe.ellipsoid
                );
                
                if (cartesian) {
                  const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                  latLngs.push([
                    Cesium.Math.toDegrees(cartographic.latitude),
                    Cesium.Math.toDegrees(cartographic.longitude)
                  ]);
                }
              });
              
              if (latLngs.length >= 3) {
                // Simplify the polygon to reduce vertices and improve editing performance
                try {
                  const turfPolygon = turf.polygon([[...latLngs.map(c => [c[1], c[0]]), [latLngs[0][1], latLngs[0][0]]]]);
                  const simplified = turf.simplify(turfPolygon, { tolerance: 0.00002, highQuality: false });
                  const simplifiedCoords = simplified.geometry.coordinates[0];
                  simplifiedCoords.pop(); // remove the closing coordinate
                  latLngs = simplifiedCoords.map(c => [c[1], c[0]]);
                } catch (e) {
                  console.error("Simplification error:", e);
                }

                newPolygons.push({
                    tempId: `detected_${Date.now()}_${Math.random()}`,
                    coordinates: latLngs,
                    confidence: prediction.confidence,
                    name: "Detected Farm"
                });
              }
            }
          });
          
          if (newPolygons.length > 0) {
            setPolygons([...polygons, ...newPolygons]);
            toast.success(`Detected ${totalFarms} boundaries!`, { id: toastId });
            
            // Auto-save new detections to DB
            newPolygons.forEach(p => {
                 const m = calculatePolygonMetrics(p.coordinates);
                 savePolygon({
                     name: p.name,
                     coordinates: p.coordinates,
                     area: m.area,
                     perimeter: m.perimeter,
                     confidence: p.confidence
                 }).then(saved => {
                     setPolygons(prev => prev.map(existing => existing.tempId === p.tempId ? saved : existing));
                 }).catch(console.error);
            });
            
          } else {
             toast.error("No boundaries detected.", { id: toastId });
          }
      } else {
          toast.error(result.error || "No boundaries detected.", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred.", { id: toastId });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (event) => {
          const base64Image = event.target.result;
          setUploadedImage(base64Image);
          
          setIsDetecting(true);
          const toastId = toast.loading("Analyzing uploaded image...");
          
          try {
              const result = await detectBoundaries(base64Image);
              if (result.success) {
                  toast.success(`Detected ${result.predictions?.length || 0} boundaries!`, { id: toastId });
              } else {
                  toast.error(result.error || "No boundaries detected.", { id: toastId });
              }
          } catch (error) {
              toast.error("Analysis failed.", { id: toastId });
          } finally {
              setIsDetecting(false);
          }
      };
      reader.readAsDataURL(file);
  };

  const mockChartData = [
      { name: 'Jan', carbon: 4000 },
      { name: 'Feb', carbon: 4500 },
      { name: 'Mar', carbon: 4800 },
      { name: 'Apr', carbon: 5200 },
      { name: 'May', carbon: Math.max(5000, 5000 + (detectionCount * 100)) },
  ];

  return (
    <div className="w-80 lg:w-[400px] bg-slate-950/80 backdrop-blur-xl border-r border-slate-800 flex flex-col z-10 shadow-2xl relative">
      <div className="p-6 bg-transparent border-b border-slate-800/50">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center gap-2">
          <Globe className="w-6 h-6 text-emerald-400" />
          Carbon Ledger
          <br/>
          <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Geospatial Intelligence</span>
        </h1>
      </div>
      
      <div className="flex border-b border-slate-800/50">
          <button onClick={() => setActiveTab('globe')} className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === 'globe' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>Globe</button>
          <button onClick={() => setActiveTab('upload')} className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === 'upload' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>Upload</button>
          <button onClick={() => setActiveTab('analytics')} className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === 'analytics' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>Analytics</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        
        {/* If a Polygon is Selected, Show Editing/Analytics Panel */}
        {selectedPolygon ? (
             <div className="space-y-6">
                 <div className="flex justify-between items-center">
                     <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                         Polygon Editor
                     </h2>
                     <button onClick={() => setSelectedPolygonId(null)} className="text-xs text-slate-500 hover:text-slate-300 underline">Close</button>
                 </div>
                 
                 <div className="bg-slate-900/50 border border-emerald-500/30 rounded-xl p-4 flex flex-col gap-3">
                     <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                         <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
                         <span className="text-xs font-bold text-emerald-400">{selectedPolygon._id ? 'Saved' : 'Unsaved Draft'}</span>
                     </div>
                     <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                         <span className="text-xs font-bold text-slate-400 uppercase">Vertices</span>
                         <span className="text-sm font-bold text-slate-200">{selectedPolygon.coordinates?.length || 0}</span>
                     </div>
                     <div className="flex flex-col gap-1 border-b border-slate-800 pb-2">
                         <span className="text-xs font-bold text-slate-400 uppercase">Area</span>
                         <span className="text-2xl font-light text-cyan-400">
                             {(metrics.area / 10000).toFixed(2)} <span className="text-sm text-slate-500">hectares</span>
                         </span>
                         <span className="text-xs text-slate-500">{metrics.area.toFixed(2)} sq meters</span>
                     </div>
                     <div className="flex flex-col gap-1 pb-2">
                         <span className="text-xs font-bold text-slate-400 uppercase">Perimeter</span>
                         <span className="text-xl font-light text-purple-400">
                             {metrics.perimeter.toFixed(2)} <span className="text-sm text-slate-500">meters</span>
                         </span>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-2 mt-2">
                         <button onClick={flyToSelected} className="col-span-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg px-3 py-2 text-xs font-medium transition-all">
                             Fly to Boundary
                         </button>
                         <button onClick={handleSavePolygon} className="flex items-center justify-center gap-2 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-900/50 rounded-lg px-3 py-2 text-xs font-medium transition-all">
                             <Save className="w-3.5 h-3.5" /> Save
                         </button>
                         <button onClick={handleDeletePolygon} className="flex items-center justify-center gap-2 bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 rounded-lg px-3 py-2 text-xs font-medium transition-all">
                             <Trash2 className="w-3.5 h-3.5" /> Delete
                         </button>
                     </div>
                 </div>
                 
                 <div className="text-xs text-slate-500 bg-slate-900/30 p-3 rounded-lg border border-slate-800">
                     <strong>Tip:</strong> Drag the white points on the map to reshape the polygon. Right-click a point to remove it.
                 </div>
             </div>
        ) : (
          activeTab === 'globe' && (
              <>
                  <section className="space-y-4">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Coordinates
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input type="text" value={lat} onChange={e => setLat(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all" placeholder="Lat" />
                      </div>
                      <div>
                        <input type="text" value={lng} onChange={e => setLng(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all" placeholder="Lng" />
                      </div>
                    </div>
                    <button onClick={handleGoToLocation} className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700/50 rounded-lg px-4 py-2 text-sm font-medium transition-all shadow-sm">
                      Fly to Location
                    </button>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Scan className="w-4 h-4" /> AI Analysis
                    </h2>
                    <button onClick={handleGlobeDetect} disabled={isDetecting} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg px-4 py-3 transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2">
                      {isDetecting ? 'Analyzing Terrain...' : 'Scan Visible Region'}
                    </button>
                    <div className="flex justify-between items-center px-2">
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Detected Boundaries</span>
                      <span className="text-xl font-bold text-emerald-400">{detectionCount}</span>
                    </div>
                  </section>
                  
                  <section className="space-y-4">
                      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <PenTool className="w-4 h-4" /> Editing Tools
                      </h2>
                      <button onClick={handleDrawMode} className={`w-full ${window.isDrawingMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700/50'} border rounded-lg px-4 py-2 text-sm font-medium transition-all shadow-sm`}>
                        {window.isDrawingMode ? 'Finish Drawing' : 'Draw New Polygon'}
                      </button>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Download className="w-4 h-4" /> Export Tools
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setBoundariesVisible(!boundariesVisible)} className="flex items-center justify-center gap-2 bg-slate-900/50 hover:bg-slate-800 text-slate-300 rounded-lg px-3 py-2 text-xs font-medium transition-colors border border-slate-700/50">
                        {boundariesVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {boundariesVisible ? 'Hide' : 'Show'}
                      </button>
                      <button onClick={onClearBoundaries} className="flex items-center justify-center gap-2 bg-red-950/30 hover:bg-red-900/40 text-red-400 rounded-lg px-3 py-2 text-xs font-medium transition-colors border border-red-900/30">
                        <Trash2 className="w-3.5 h-3.5" /> Clear
                      </button>
                      <button onClick={onExportGeoJSON} className="flex items-center justify-center gap-2 bg-slate-900/50 hover:bg-slate-800 text-cyan-400 rounded-lg px-3 py-2 text-xs font-medium transition-colors border border-slate-700/50">
                        <Download className="w-3.5 h-3.5" /> GeoJSON
                      </button>
                      <button onClick={onExportPNG} className="flex items-center justify-center gap-2 bg-slate-900/50 hover:bg-slate-800 text-purple-400 rounded-lg px-3 py-2 text-xs font-medium transition-colors border border-slate-700/50">
                        <ImageIcon className="w-3.5 h-3.5" /> Snapshot
                      </button>
                      <button onClick={() => exportToCSV(polygons)} className="flex items-center justify-center gap-2 bg-slate-900/50 hover:bg-slate-800 text-green-400 rounded-lg px-3 py-2 text-xs font-medium transition-colors border border-slate-700/50">
                        <Download className="w-3.5 h-3.5" /> CSV
                      </button>
                      <button onClick={() => exportToKML(polygons)} className="flex items-center justify-center gap-2 bg-slate-900/50 hover:bg-slate-800 text-amber-400 rounded-lg px-3 py-2 text-xs font-medium transition-colors border border-slate-700/50">
                        <Download className="w-3.5 h-3.5" /> KML
                      </button>
                    </div>
                  </section>
              </>
          )
        )}

        {!selectedPolygon && activeTab === 'upload' && (
            <section className="space-y-6">
                 <div className="text-sm text-slate-400 leading-relaxed">
                    Upload high-resolution satellite imagery or drone footage to analyze specific plots without geospatial metadata.
                 </div>
                 
                 <div className="relative group">
                     <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                     <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-slate-900/30 group-hover:border-emerald-500/50 group-hover:bg-slate-900/50 transition-all">
                         <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                         <span className="text-sm font-medium text-slate-300">Click or drag image to upload</span>
                     </div>
                 </div>
                 
                 {uploadedImage && (
                     <div className="space-y-2">
                         <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Preview</span>
                         <img src={uploadedImage} alt="Uploaded" className="w-full rounded-lg border border-slate-700" />
                     </div>
                 )}
            </section>
        )}

        {!selectedPolygon && activeTab === 'analytics' && (
            <section className="space-y-6">
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Est. Carbon Stock</span>
                    <span className="text-3xl font-light text-emerald-400">{Math.max(5000, 5000 + (detectionCount * 100))} <span className="text-sm text-slate-500">tCO₂e</span></span>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Parcels</span>
                    <span className="text-3xl font-light text-cyan-400">{detectionCount}</span>
                </div>
                
                <div className="space-y-2 pt-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" /> Carbon Accrual
                    </span>
                    <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockChartData}>
                                <defs>
                                  <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#10b981' }}
                                />
                                <Area type="monotone" dataKey="carbon" stroke="#10b981" fillOpacity={1} fill="url(#colorCarbon)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>
        )}

      </div>
    </div>
  );
};

export default Sidebar;
