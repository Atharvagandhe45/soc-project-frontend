import React, { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

const CesiumGlobe = ({ targetCoordinates, polygons, setPolygons, boundariesVisible, setMapViewer, setTargetCoordinates, selectedPolygonId, setSelectedPolygonId, activeLayer = 'rgb' }) => {
  const cesiumContainer = useRef(null);
  const initialized = useRef(false);
  const [viewer, setViewer] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const drawingPointsRef = useRef([]);
  const drawingEntityRef = useRef(null);
  const draggedPointRef = useRef(null);

  useEffect(() => {
    if (!cesiumContainer.current || initialized.current) return;
    initialized.current = true;

    const esriProvider = new Cesium.UrlTemplateImageryProvider({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      maximumLevel: 20
    });

    const newViewer = new Cesium.Viewer(cesiumContainer.current, {
      baseLayer: new Cesium.ImageryLayer(esriProvider),
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      scene3DOnly: true,
      contextOptions: {
        webgl: {
            preserveDrawingBuffer: true
        }
      }
    });

    const creditContainer = newViewer.cesiumWidget.creditContainer;
    if (creditContainer) creditContainer.style.display = 'none';

    setViewer(newViewer);
    if (setMapViewer) setMapViewer(newViewer);

    // Interaction Handler
    const handler = new Cesium.ScreenSpaceEventHandler(newViewer.scene.canvas);
    
    // LEFT_DOWN: Pick point for dragging or pick polygon for selection
    handler.setInputAction((movement) => {
      const pickedObject = newViewer.scene.pick(movement.position);
      
      // If we are in drawing mode, add a point
      if (window.isDrawingMode) {
          const cartesian = newViewer.camera.pickEllipsoid(movement.position, newViewer.scene.globe.ellipsoid);
          if (cartesian) {
              const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
              const lat = Cesium.Math.toDegrees(cartographic.latitude);
              const lng = Cesium.Math.toDegrees(cartographic.longitude);
              
              setPolygons(prevPolygons => {
                  return prevPolygons.map(p => {
                      if (p.isDrawing) {
                          return { ...p, coordinates: [...p.coordinates, [lat, lng]] };
                      }
                      return p;
                  });
              });
          }
          return;
      }

      if (Cesium.defined(pickedObject)) {
        if (pickedObject.id && pickedObject.id.polygonId) {
          // Clicked a polygon
          setSelectedPolygonId(pickedObject.id.polygonId);
        } else if (pickedObject.id && pickedObject.id.vertexIndex !== undefined) {
          // Clicked a vertex point
          newViewer.scene.screenSpaceCameraController.enableRotate = false;
          draggedPointRef.current = pickedObject.id;
        }
      } else {
        // Clicked empty space
        setSelectedPolygonId(null);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    // MOUSE_MOVE: Dragging vertex
    handler.setInputAction((movement) => {
        if (draggedPointRef.current) {
            const cartesian = newViewer.camera.pickEllipsoid(movement.endPosition, newViewer.scene.globe.ellipsoid);
            if (cartesian) {
                // Just update the reference visually, don't update React state to avoid lag
                draggedPointRef.current.latestCartesian = cartesian;
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // LEFT_UP: Stop dragging
    handler.setInputAction(() => {
        if (draggedPointRef.current) {
            if (draggedPointRef.current.latestCartesian) {
                const cartesian = draggedPointRef.current.latestCartesian;
                const polyId = draggedPointRef.current.parentPolygonId;
                const vIndex = draggedPointRef.current.vertexIndex;
                
                setPolygons(prevPolygons => {
                    return prevPolygons.map(p => {
                        if (p._id === polyId || p.tempId === polyId) {
                            const newCoords = [...p.coordinates];
                            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                            newCoords[vIndex] = [
                                Cesium.Math.toDegrees(cartographic.latitude),
                                Cesium.Math.toDegrees(cartographic.longitude)
                            ];
                            return { ...p, coordinates: newCoords };
                        }
                        return p;
                    });
                });
                draggedPointRef.current.latestCartesian = null;
            }
            draggedPointRef.current = null;
            newViewer.scene.screenSpaceCameraController.enableRotate = true;
        }
    }, Cesium.ScreenSpaceEventType.LEFT_UP);

    // RIGHT_CLICK: Remove vertex
    handler.setInputAction((movement) => {
        const pickedObject = newViewer.scene.pick(movement.position);
        if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.vertexIndex !== undefined) {
            const polyId = pickedObject.id.parentPolygonId;
            const vIndex = pickedObject.id.vertexIndex;
            
            setPolygons(prevPolygons => {
                return prevPolygons.map(p => {
                    if ((p._id === polyId || p.tempId === polyId) && p.coordinates.length > 3) {
                        const newCoords = [...p.coordinates];
                        newCoords.splice(vIndex, 1);
                        return { ...p, coordinates: newCoords };
                    }
                    return p;
                });
            });
        }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    // Click to get coordinates for Fly To if not picking anything
    handler.setInputAction((movement) => {
        if (!Cesium.defined(newViewer.scene.pick(movement.position))) {
            const cartesian = newViewer.camera.pickEllipsoid(movement.position, newViewer.scene.globe.ellipsoid);
            if (cartesian) {
                const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                if (setTargetCoordinates) {
                    setTargetCoordinates({ 
                        lat: parseFloat(Cesium.Math.toDegrees(cartographic.latitude).toFixed(6)), 
                        lng: parseFloat(Cesium.Math.toDegrees(cartographic.longitude).toFixed(6)) 
                    });
                }
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      if (newViewer && !newViewer.isDestroyed()) {
        newViewer.destroy();
      }
      initialized.current = false;
      if (cesiumContainer.current) {
         cesiumContainer.current.innerHTML = '';
      }
    };
  }, []);

  // Handle flying to coordinates
  useEffect(() => {
    if (viewer && targetCoordinates?.lat && targetCoordinates?.lng) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          targetCoordinates.lng, 
          targetCoordinates.lat, 
          targetCoordinates.height || 1000 // height in meters
        ),
        duration: 1.5
      });
    }
  }, [viewer, targetCoordinates]);

  // Handle temporary search marker
  useEffect(() => {
    if (!viewer) return;
    const entityId = 'search_marker';
    viewer.entities.removeById(entityId);
    
    if (targetCoordinates?.isSearch) {
        viewer.entities.add({
            id: entityId,
            position: Cesium.Cartesian3.fromDegrees(targetCoordinates.lng, targetCoordinates.lat),
            billboard: {
                image: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                `),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                width: 32,
                height: 32
            }
        });
    }
  }, [viewer, targetCoordinates]);

  // Handle drawing polygons and vertices
  useEffect(() => {
    if (!viewer) return;

    viewer.entities.removeAll();

    if (boundariesVisible && polygons && polygons.length > 0) {
      polygons.forEach((poly, index) => {
        const polyId = poly._id || poly.tempId || index.toString();
        const hierarchy = new Cesium.CallbackProperty(() => {
            return new Cesium.PolygonHierarchy(poly.coordinates.map((pt, vIndex) => {
                if (draggedPointRef.current && draggedPointRef.current.parentPolygonId === polyId && draggedPointRef.current.vertexIndex === vIndex && draggedPointRef.current.latestCartesian) {
                    return draggedPointRef.current.latestCartesian;
                }
                return Cesium.Cartesian3.fromDegrees(pt[1], pt[0]);
            }));
        }, false);
        
        const isSelected = selectedPolygonId === polyId;

        // Add Polygon
        viewer.entities.add({
          id: `poly_${polyId}`,
          polygonId: polyId,
          polygon: {
            hierarchy: hierarchy,
            material: new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty(() => {
                if (isSelected) {
                    if (activeLayer === 'ndvi') return Cesium.Color.fromCssColorString('rgba(16, 185, 129, 0.6)'); // Emerald
                    if (activeLayer === 'savi') return Cesium.Color.fromCssColorString('rgba(245, 158, 11, 0.6)'); // Amber
                    if (activeLayer === 'ndmi') return Cesium.Color.fromCssColorString('rgba(34, 211, 238, 0.6)'); // Cyan
                    return Cesium.Color.fromCssColorString('rgba(56, 189, 248, 0.4)'); // Default Selection
                }
                return Cesium.Color.fromCssColorString('rgba(16, 185, 129, 0.2)'); // Unselected
            }, false)),
            outline: true,
            outlineColor: isSelected ? Cesium.Color.fromCssColorString('#38bdf8') : Cesium.Color.fromCssColorString('#10b981'),
            outlineWidth: isSelected ? 4 : 2,
            clampToGround: true
          }
        });

        // If selected, add editable vertices
        if (isSelected) {
            poly.coordinates.forEach((pt, vIndex) => {
                viewer.entities.add({
                    id: `vertex_${polyId}_${vIndex}`,
                    vertexIndex: vIndex,
                    parentPolygonId: polyId,
                    position: new Cesium.CallbackProperty(() => {
                        if (draggedPointRef.current && draggedPointRef.current.parentPolygonId === polyId && draggedPointRef.current.vertexIndex === vIndex && draggedPointRef.current.latestCartesian) {
                            return draggedPointRef.current.latestCartesian;
                        }
                        // Dynamic position for dragging
                        const currentPoly = polygons.find(p => (p._id === polyId || p.tempId === polyId));
                        if(currentPoly && currentPoly.coordinates[vIndex]) {
                             return Cesium.Cartesian3.fromDegrees(currentPoly.coordinates[vIndex][1], currentPoly.coordinates[vIndex][0]);
                        }
                        return Cesium.Cartesian3.fromDegrees(pt[1], pt[0]);
                    }, false),
                    point: {
                        pixelSize: 12,
                        color: Cesium.Color.WHITE,
                        outlineColor: Cesium.Color.fromCssColorString('#38bdf8'),
                        outlineWidth: 3,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    }
                });
            });
        }
      });
    }
  }, [viewer, polygons, boundariesVisible, selectedPolygonId]);

  const handleZoomIn = () => {
    if (viewer) {
      viewer.camera.zoomIn(viewer.camera.positionCartographic.height * 0.4);
    }
  };

  const handleZoomOut = () => {
    if (viewer) {
      viewer.camera.zoomOut(viewer.camera.positionCartographic.height * 0.4);
    }
  };

  return (
    <div className="w-full h-full relative z-0">
      <div ref={cesiumContainer} className="w-full h-full bg-slate-900" />
      
      {/* Native Zoom Controls */}
      <div className="absolute bottom-8 right-8 z-50 flex flex-col gap-2">
        <button 
          onClick={handleZoomIn}
          className="w-10 h-10 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md border border-slate-600 rounded-lg shadow-lg flex items-center justify-center text-slate-200 hover:text-emerald-400 transition-colors"
          title="Zoom In"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" /></svg>
        </button>
        <button 
          onClick={handleZoomOut}
          className="w-10 h-10 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md border border-slate-600 rounded-lg shadow-lg flex items-center justify-center text-slate-200 hover:text-emerald-400 transition-colors"
          title="Zoom Out"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
        </button>
      </div>
    </div>
  );
};

export default CesiumGlobe;
