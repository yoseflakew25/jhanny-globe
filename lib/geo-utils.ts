/**
 * Checks if a point [lon, lat] is inside a polygon
 * @param point [longitude, latitude]
 * @param polygon array of rings, where each ring is an array of [lon, lat]
 */
export function isPointInPolygon(point: [number, number], polygon: number[][][]): boolean {
    const [x, y] = point;
    let inside = false;

    // Most GeoJSON Polygons have one exterior ring and possibly multiple interior rings (holes)
    for (let i = 0; i < polygon.length; i++) {
        const ring = polygon[i];
        let ringInside = false;

        for (let j = 0, k = ring.length - 1; j < ring.length; k = j++) {
            const xi = ring[j][0], yi = ring[j][1];
            const xj = ring[k][0], yj = ring[k][1];

            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

            if (intersect) ringInside = !ringInside;
        }

        // If it's the first ring (exterior), it sets the inside state
        // If it's subsequent rings (holes), it flips it back
        if (i === 0) {
            inside = ringInside;
        } else if (ringInside) {
            // If we are "inside" a hole, we are outside the polygon
            inside = false;
        }
    }

    return inside;
}

/**
 * Checks if a point is inside a MultiPolygon
 */
export function isPointInMultiPolygon(point: [number, number], multiPolygon: number[][][][]): boolean {
    for (const polygon of multiPolygon) {
        if (isPointInPolygon(point, polygon)) return true;
    }
    return false;
}
