import * as turf from '@turf/turf';

export const calculatePolygonMetrics = (coordinates) => {
    if (!coordinates || coordinates.length < 3) {
        return { area: 0, perimeter: 0 };
    }

    try {
        // Turf expects first and last coordinate to be the same to form a closed ring
        const coords = [...coordinates];
        if (
            coords[0][0] !== coords[coords.length - 1][0] ||
            coords[0][1] !== coords[coords.length - 1][1]
        ) {
            coords.push([...coords[0]]);
        }

        // Convert [lat, lng] to [lng, lat] for Turf
        const turfCoords = coords.map(c => [c[1], c[0]]);
        const polygon = turf.polygon([turfCoords]);

        const areaSqMeters = turf.area(polygon);
        const perimeterMeters = turf.length(turf.lineString(turfCoords), { units: 'meters' });

        return {
            area: areaSqMeters,
            perimeter: perimeterMeters,
            center: turf.centerOfMass(polygon).geometry.coordinates // [lng, lat]
        };
    } catch (e) {
        console.error("Error calculating metrics:", e);
        return { area: 0, perimeter: 0 };
    }
};
