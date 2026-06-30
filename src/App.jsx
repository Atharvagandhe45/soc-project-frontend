import React, { useState, useEffect } from 'react';
import CesiumGlobe from './components/CesiumGlobe';
import NavigationSidebar from './components/NavigationSidebar';
import RightPanel from './components/RightPanel';
import LayerControls from './components/LayerControls';
import { Toaster } from 'react-hot-toast';
import { exportToGeoJSON, exportToPNG } from './utils/export';
import { fetchPolygons } from './services/api';

function App() {
  const [activeModule, setActiveModule] = useState('farm_boundaries');
  const [activeLayer, setActiveLayer] = useState('rgb');
  
  const [targetCoordinates, setTargetCoordinates] = useState({ lat: 19.0760, lng: 72.8777 });
  const [polygons, setPolygons] = useState([]);
  const [selectedPolygonId, setSelectedPolygonId] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [boundariesVisible, setBoundariesVisible] = useState(true);
  
  const [mapViewer, setMapViewer] = useState(null);

  useEffect(() => {
    const loadPolygons = async () => {
      const data = await fetchPolygons();
      setPolygons(data);
    };
    loadPolygons();
  }, []);

  const handleGoToLocation = (lat, lng, height = 1000, isSearch = false) => {
    setTargetCoordinates({ lat: parseFloat(lat), lng: parseFloat(lng), height, isSearch });
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-emerald-500/30">
      
      {/* Left Navigation */}
      <NavigationSidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      
      {/* Center Globe Area */}
      <div className="flex-1 relative">
        <CesiumGlobe 
          targetCoordinates={targetCoordinates}
          setTargetCoordinates={setTargetCoordinates}
          polygons={polygons}
          setPolygons={setPolygons}
          boundariesVisible={boundariesVisible}
          setMapViewer={setMapViewer}
          selectedPolygonId={selectedPolygonId}
          setSelectedPolygonId={setSelectedPolygonId}
          activeLayer={activeLayer}
        />
        
        {/* Bottom Layer Controls */}
        <LayerControls activeLayer={activeLayer} setActiveLayer={setActiveLayer} />
      </div>

      {/* Right Analytics/Tools Panel */}
      <RightPanel 
        activeModule={activeModule}
        targetCoordinates={targetCoordinates}
        setTargetCoordinates={setTargetCoordinates}
        onGoToLocation={handleGoToLocation}
        isDetecting={isDetecting}
        setIsDetecting={setIsDetecting}
        detectionCount={polygons.length}
        boundariesVisible={boundariesVisible}
        setBoundariesVisible={setBoundariesVisible}
        mapViewer={mapViewer}
        polygons={polygons}
        setPolygons={setPolygons}
        selectedPolygonId={selectedPolygonId}
        setSelectedPolygonId={setSelectedPolygonId}
        onClearBoundaries={() => setPolygons([])}
        onExportGeoJSON={() => exportToGeoJSON(polygons)}
        onExportPNG={() => exportToPNG(mapViewer?.canvas)}
      />

      <Toaster position="bottom-right" toastOptions={{
        className: 'bg-slate-900 text-slate-200 border border-slate-800',
        style: {
          background: '#0f172a',
          color: '#f8fafc',
          border: '1px solid #1e293b'
        }
      }} />
    </div>
  );
}

export default App;
