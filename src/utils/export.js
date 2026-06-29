import * as htmlToImage from 'html-to-image';
import { calculatePolygonMetrics } from './polygonUtils';

export const exportToGeoJSON = (polygons) => {
  if (polygons.length === 0) {
    alert("No boundaries to export");
    return;
  }

  const features = polygons.map(poly => {
    // GeoJSON uses [longitude, latitude] format
    const coordinates = poly.coordinates.map(pt => [pt[1], pt[0]]);
    // Ensure the polygon is closed (first point == last point)
    if (
      coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
      coordinates[0][1] !== coordinates[coordinates.length - 1][1]
    ) {
      coordinates.push([...coordinates[0]]);
    }

    return {
      type: "Feature",
      properties: {
        id: poly._id || poly.tempId,
        name: poly.name || "Farm Boundary",
        confidence: poly.confidence || 1.0,
        area: poly.area,
        perimeter: poly.perimeter,
        class: "farm_boundary"
      },
      geometry: {
        type: "Polygon",
        coordinates: [coordinates]
      }
    };
  });

  const geojson = {
    type: "FeatureCollection",
    features: features
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "farm_boundaries.geojson");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const exportToPNG = async (canvasElement) => {
  if (!canvasElement) {
    alert("Map not ready for export");
    return;
  }
  try {
    const dataUrl = canvasElement.toDataURL("image/png");
    const link = document.createElement('a');
    link.download = 'farm_map.png';
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error("Error exporting PNG:", err);
    alert("Failed to export map as PNG");
  }
};

export const exportToCSV = (polygons) => {
  if (polygons.length === 0) {
    alert("No boundaries to export");
    return;
  }

  const headers = ["ID", "Name", "Area (sq m)", "Perimeter (m)", "Coordinates Array"];
  const rows = polygons.map(p => {
    const metrics = calculatePolygonMetrics(p.coordinates);
    return [
        p._id || p.tempId || '',
        `"${p.name || 'Farm Boundary'}"`,
        metrics.area.toFixed(2),
        metrics.perimeter.toFixed(2),
        `"${JSON.stringify(p.coordinates)}"`
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "farm_boundaries.csv");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const exportToKML = (polygons) => {
    if (polygons.length === 0) {
      alert("No boundaries to export");
      return;
    }
  
    let placemarks = polygons.map(poly => {
      const coordinatesStr = poly.coordinates.map(pt => `${pt[1]},${pt[0]},0`).join(' ');
      const name = poly.name || "Farm Boundary";
      const metrics = calculatePolygonMetrics(poly.coordinates);
      
      return `
        <Placemark>
          <name>${name}</name>
          <description>
            Area: ${metrics.area.toFixed(2)} sq meters
            Perimeter: ${metrics.perimeter.toFixed(2)} meters
          </description>
          <Polygon>
            <extrude>1</extrude>
            <altitudeMode>clampToGround</altitudeMode>
            <outerBoundaryIs>
              <LinearRing>
                <coordinates>
                  ${coordinatesStr}
                </coordinates>
              </LinearRing>
            </outerBoundaryIs>
          </Polygon>
        </Placemark>
      `;
    }).join('\n');
  
    const kml = `<?xml version="1.0" encoding="UTF-8"?>
  <kml xmlns="http://www.opengis.net/kml/2.2">
    <Document>
      <name>Farm Boundaries</name>
      ${placemarks}
    </Document>
  </kml>`;
  
    const dataStr = "data:application/vnd.google-earth.kml+xml;charset=utf-8," + encodeURIComponent(kml);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "farm_boundaries.kml");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};
