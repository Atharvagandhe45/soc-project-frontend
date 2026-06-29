import React from 'react';
import FarmBoundariesModule from './modules/FarmBoundariesModule';
import SatelliteAnalyticsModule from './modules/SatelliteAnalyticsModule';
import SOCIntelligenceModule from './modules/SOCIntelligenceModule';
import SHAPExplainabilityModule from './modules/SHAPExplainabilityModule';
import CarbonSequestrationModule from './modules/CarbonSequestrationModule';
import CarbonCreditWorkflow from './modules/CarbonCreditWorkflow';

const RightPanel = ({ 
  activeModule, 
  targetCoordinates, 
  setTargetCoordinates,
  onGoToLocation,
  isDetecting,
  setIsDetecting,
  detectionCount,
  boundariesVisible,
  setBoundariesVisible,
  mapViewer,
  polygons,
  setPolygons,
  selectedPolygonId,
  setSelectedPolygonId,
  onClearBoundaries,
  onExportGeoJSON,
  onExportPNG
}) => {

  const renderModule = () => {
    switch (activeModule) {
      case 'farm_boundaries':
        return (
          <FarmBoundariesModule
            targetCoordinates={targetCoordinates}
            setTargetCoordinates={setTargetCoordinates}
            onGoToLocation={onGoToLocation}
            isDetecting={isDetecting}
            setIsDetecting={setIsDetecting}
            detectionCount={detectionCount}
            boundariesVisible={boundariesVisible}
            setBoundariesVisible={setBoundariesVisible}
            mapViewer={mapViewer}
            polygons={polygons}
            setPolygons={setPolygons}
            selectedPolygonId={selectedPolygonId}
            setSelectedPolygonId={setSelectedPolygonId}
            onClearBoundaries={onClearBoundaries}
            onExportGeoJSON={onExportGeoJSON}
            onExportPNG={onExportPNG}
          />
        );
      case 'satellite_analytics':
        return <SatelliteAnalyticsModule selectedPolygon={polygons.find(p => p._id === selectedPolygonId || p.tempId === selectedPolygonId)} />;
      case 'soc_intelligence':
        return <SOCIntelligenceModule selectedPolygon={polygons.find(p => p._id === selectedPolygonId || p.tempId === selectedPolygonId)} />;
      case 'carbon_sequestration':
        return <CarbonSequestrationModule selectedPolygon={polygons.find(p => p._id === selectedPolygonId || p.tempId === selectedPolygonId)} />;
      case 'carbon_credits':
        return <CarbonCreditWorkflow selectedPolygon={polygons.find(p => p._id === selectedPolygonId || p.tempId === selectedPolygonId)} />;
      case 'dashboard':
      case 'reports':
      case 'settings':
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
            <h2 className="text-xl font-light text-slate-300">Module under construction</h2>
            <p className="text-sm text-center max-w-xs">
              Select Farm Boundaries to edit polygons or Satellite Analytics to view indices.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-80 lg:w-[450px] bg-slate-950/90 backdrop-blur-2xl border-l border-slate-800/60 flex flex-col z-20 shadow-[-4px_0_24px_rgba(0,0,0,0.5)] transition-all duration-300 h-full overflow-hidden">
      {renderModule()}
    </div>
  );
};

export default RightPanel;
