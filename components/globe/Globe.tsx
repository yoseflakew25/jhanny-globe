"use client";

import * as THREE from "three";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { GeoJSONWorldData } from "@/types/geoJson";
import { isPointInPolygon, isPointInMultiPolygon } from "@/lib/geo-utils";
import { JAHNNY_VISITED_COUNTRIES } from "@/lib/constants";

interface GlobeProps {
    onCountryClick: (country: string | null) => void;
    onCountryHover: (country: string | null) => void;
    selectedCountry: string | null;
}

export default function Globe({ onCountryClick, onCountryHover, selectedCountry }: GlobeProps) {
    const [geoData, setGeoData] = useState<GeoJSONWorldData | null>(null);
    const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const GLOBE_RADIUS = 2;

    // Cache bounding boxes
    const featureBounds = useMemo(() => {
        if (!geoData) return [];
        return geoData.features.map((feature) => {
            let minX = 180, minY = 90, maxX = -180, maxY = -90;
            let rings: number[][][] = [];
            if (feature.geometry.type === "Polygon") {
                rings = feature.geometry.coordinates as number[][][];
            } else if (feature.geometry.type === "MultiPolygon") {
                rings = (feature.geometry.coordinates as number[][][][]).flat();
            }
            rings.forEach((ring) =>
                ring.forEach(([lon, lat]) => {
                    if (lon < minX) minX = lon;
                    if (lon > maxX) maxX = lon;
                    if (lat < minY) minY = lat;
                    if (lat > maxY) maxY = lat;
                })
            );
            return { minX, minY, maxX, maxY };
        });
    }, [geoData]);

    useEffect(() => {
        setLoading(true);
        fetch("/world.geojson")
            .then((res) => res.json())
            .then((data: GeoJSONWorldData) => {
                setGeoData(data);
                setLoading(false);
            });
    }, []);

    const convertToSphere = useCallback((lon: number, lat: number, radius = GLOBE_RADIUS) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        return new THREE.Vector3(
            -radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }, []);

    // 1. Generate THREE separate geometries for optimal performance:
    // - All Borders (Muted White)
    // - Visited Fill (Jahnny's Trail - Solid Green)
    const worldLayers = useMemo(() => {
        if (!geoData) return { borders: null, visitedBorders: null, visitedTexture: null };

        // 1. Create a 4K Canvas for perfect concave landmass fills
        const canvas = document.createElement("canvas");
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext("2d");
        if (!ctx) return { borders: null, visitedBorders: null, visitedTexture: null };

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#00ff00"; // Vibrant Neon Green

        const borderPoints: THREE.Vector3[] = [];
        const visitedBorderPoints: THREE.Vector3[] = [];

        geoData.features.forEach((feature) => {
            const name = feature.properties.name || feature.properties.admin || "";
            const isVisited = JAHNNY_VISITED_COUNTRIES.some(v =>
                name.toLowerCase() === v.toLowerCase() ||
                (feature.properties.formal_en && feature.properties.formal_en.toLowerCase() === v.toLowerCase())
            );

            let polygons: number[][][][] = [];
            if (feature.geometry.type === "Polygon") {
                polygons = [feature.geometry.coordinates as number[][][]];
            } else if (feature.geometry.type === "MultiPolygon") {
                polygons = feature.geometry.coordinates as number[][][][];
            }

            if (isVisited) ctx.beginPath();

            polygons.forEach((polygon) => {
                polygon.forEach((ring) => {
                    if (ring.length < 3) return;

                    // A. Draw to Canvas for the "Perfect Fill" logic
                    if (isVisited) {
                        ring.forEach(([lon, lat], i) => {
                            const x = (lon + 180) * (canvas.width / 360);
                            const y = (90 - lat) * (canvas.height / 180);
                            if (i === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        });
                        ctx.closePath();
                    }

                    // B. Build Vector Segments for the "Sharp Borders" logic
                    for (let i = 0; i < ring.length - 1; i++) {
                        const p = convertToSphere(ring[i][0], ring[i][1], GLOBE_RADIUS + 0.002);
                        const nextP = convertToSphere(ring[i + 1][0], ring[i + 1][1], GLOBE_RADIUS + 0.002);
                        borderPoints.push(p, nextP);
                        if (isVisited) visitedBorderPoints.push(p, nextP);
                    }
                });
            });

            if (isVisited) ctx.fill();
        });

        const borders = new THREE.BufferGeometry().setFromPoints(borderPoints);
        const visitedBorders = new THREE.BufferGeometry().setFromPoints(visitedBorderPoints);

        const visitedTexture = new THREE.CanvasTexture(canvas);
        visitedTexture.anisotropy = 4;
        visitedTexture.colorSpace = THREE.SRGBColorSpace;

        return { borders, visitedBorders, visitedTexture };
    }, [geoData, convertToSphere]);

    const { borders: worldBordersGeometry, visitedBorders: visitedBordersGeometry, visitedTexture } = worldLayers;

    // 2. Optimized Geometry Generator for Selection/Hover
    const getCountryGeometries = useCallback(
        (countryName: string, radiusOffset = 0.01) => {
            if (!geoData) return null;
            const feature = geoData.features.find(
                (f) => f.properties.name === countryName || f.properties.admin === countryName
            );
            if (!feature) return null;

            const fillVertices: number[] = [];
            const fillIndices: number[] = [];
            let vertexCount = 0;

            // Handle MultiPolygons and Polygons independently per ring
            let polygons: number[][][][] = [];
            if (feature.geometry.type === "Polygon") {
                polygons = [feature.geometry.coordinates as number[][][]];
            } else if (feature.geometry.type === "MultiPolygon") {
                polygons = feature.geometry.coordinates as number[][][][];
            }

            const actualLineSegments: THREE.Vector3[] = [];
            polygons.forEach((polygon) => {
                polygon.forEach((ring) => {
                    if (ring.length < 3) return;
                    const ringStart = vertexCount;

                    // Support robust fill for concave shapes via center point
                    let avgLon = 0, avgLat = 0;
                    ring.forEach(([lon, lat]) => {
                        avgLon += lon;
                        avgLat += lat;
                    });
                    avgLon /= ring.length;
                    avgLat /= ring.length;
                    const center = convertToSphere(avgLon, avgLat, GLOBE_RADIUS + radiusOffset);

                    fillVertices.push(center.x, center.y, center.z);
                    vertexCount++;

                    ring.forEach(([lon, lat]) => {
                        const sp = convertToSphere(lon, lat, GLOBE_RADIUS + radiusOffset);
                        fillVertices.push(sp.x, sp.y, sp.z);
                        vertexCount++;
                    });

                    // Triangulate this specific ring island
                    for (let i = 1; i < ring.length; i++) {
                        fillIndices.push(ringStart, ringStart + i, ringStart + i + 1);
                    }
                    fillIndices.push(ringStart, ringStart + ring.length, ringStart + 1);

                    // Add border lines for this ring
                    for (let i = 0; i < ring.length - 1; i++) {
                        actualLineSegments.push(
                            convertToSphere(ring[i][0], ring[i][1], GLOBE_RADIUS + radiusOffset),
                            convertToSphere(ring[i + 1][0], ring[i + 1][1], GLOBE_RADIUS + radiusOffset)
                        );
                    }
                });
            });

            const lineGeom = new THREE.BufferGeometry().setFromPoints(actualLineSegments);
            const fillGeom = new THREE.BufferGeometry();
            fillGeom.setIndex(fillIndices);
            fillGeom.setAttribute("position", new THREE.Float32BufferAttribute(fillVertices, 3));
            fillGeom.computeVertexNormals();

            return { lineGeom, fillGeom };
        },
        [geoData, convertToSphere]
    );

    const selectionData = useMemo(() => {
        return selectedCountry ? getCountryGeometries(selectedCountry, 0.015) : null;
    }, [selectedCountry, getCountryGeometries]);

    const hoverData = useMemo(() => {
        return hoveredCountry && hoveredCountry !== selectedCountry
            ? getCountryGeometries(hoveredCountry, 0.012)
            : null;
    }, [hoveredCountry, selectedCountry, getCountryGeometries]);

    const findCountryAtPoint = useCallback(
        (point: THREE.Vector3) => {
            if (!geoData) return null;
            const lat = Math.asin(point.y / GLOBE_RADIUS) * (180 / Math.PI);
            let lon = Math.atan2(point.z, -point.x) * (180 / Math.PI) - 180;
            while (lon < -180) lon += 360;
            while (lon > 180) lon -= 360;

            for (let i = 0; i < geoData.features.length; i++) {
                const bounds = featureBounds[i];
                if (lon < bounds.minX || lon > bounds.maxX || lat < bounds.minY || lat > bounds.maxY) continue;
                const feature = geoData.features[i];
                const coords = feature.geometry.coordinates as any;
                if (
                    feature.geometry.type === "Polygon"
                        ? isPointInPolygon([lon, lat], coords)
                        : isPointInMultiPolygon([lon, lat], coords)
                ) {
                    return feature.properties.name || feature.properties.admin;
                }
            }
            return null;
        },
        [geoData, featureBounds]
    );

    const handlePointerMove = useCallback(
        (e: any) => {
            e.stopPropagation();
            const name = findCountryAtPoint(e.point);
            if (name !== hoveredCountry) {
                setHoveredCountry(name);
                onCountryHover(name);
            }
        },
        [findCountryAtPoint, hoveredCountry, onCountryHover]
    );

    const handlePointerOut = useCallback(() => {
        setHoveredCountry(null);
        onCountryHover(null);
    }, [onCountryHover]);

    const handleGlobeClick = useCallback(
        (e: any) => {
            e.stopPropagation();
            const name = findCountryAtPoint(e.point);
            if (!name) return;

            // Only allow clicking if the country is in the visited list
            const isVisited = JAHNNY_VISITED_COUNTRIES.some(v =>
                name.toLowerCase() === v.toLowerCase()
            );

            if (isVisited) {
                onCountryClick(selectedCountry === name ? null : name);
            }
        },
        [findCountryAtPoint, onCountryClick, selectedCountry]
    );

    // Clean up
    useEffect(() => {
        return () => {
            worldBordersGeometry?.dispose();
            visitedBordersGeometry?.dispose();
            visitedTexture?.dispose();
            selectionData?.lineGeom.dispose();
            selectionData?.fillGeom.dispose();
            hoverData?.lineGeom.dispose();
            hoverData?.fillGeom.dispose();
        };
    }, [worldBordersGeometry, visitedBordersGeometry, visitedTexture, selectionData, hoverData]);

    return (
        <group>
            <mesh onClick={handleGlobeClick} onPointerMove={handlePointerMove} onPointerOut={handlePointerOut}>
                <sphereGeometry args={[GLOBE_RADIUS, 64, 32]} />
                <meshBasicMaterial color={loading ? "#111" : "#02040a"} transparent opacity={0.9} />
            </mesh>

            <mesh>
                <sphereGeometry args={[GLOBE_RADIUS + 0.005, 48, 24]} />
                <meshBasicMaterial color="#2244aa" wireframe transparent opacity={0.04} />
            </mesh>

            {/* 1. All World Borders (Muted background) */}
            {worldBordersGeometry && (
                <lineSegments geometry={worldBordersGeometry}>
                    <lineBasicMaterial color="#aaccff" transparent opacity={0.25} />
                </lineSegments>
            )}

            {/* 2. JAHNNY'S TRAIL - Canvas-Based Perfect Solid Highlights */}
            {visitedTexture && (
                <mesh>
                    <sphereGeometry args={[GLOBE_RADIUS + 0.001, 64, 32]} />
                    <meshBasicMaterial
                        map={visitedTexture}
                        transparent
                        opacity={0.4}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                    />
                </mesh>
            )}
            {visitedBordersGeometry && (
                <group>
                    {/* Layer 1: Core Solid Highlight */}
                    <lineSegments geometry={visitedBordersGeometry}>
                        <lineBasicMaterial color="#00ff00" transparent={false} />
                    </lineSegments>

                    {/* Layer 2: Inner Glow */}
                    <lineSegments geometry={visitedBordersGeometry} scale={[1.001, 1.001, 1.001]}>
                        <lineBasicMaterial color="#00ff00" transparent opacity={0.6} depthWrite={false} />
                    </lineSegments>

                    {/* Layer 3: Atmospheric Glow (Triple Intensity) */}
                    <lineSegments geometry={visitedBordersGeometry} scale={[1.003, 1.003, 1.003]}>
                        <lineBasicMaterial color="#00ff00" transparent opacity={0.2} depthWrite={false} />
                    </lineSegments>
                </group>
            )}

            {/* 3. Hover Highlight (Green) */}
            {hoverData && (
                <group>
                    <lineSegments geometry={hoverData.lineGeom}>
                        <lineBasicMaterial color="#00ff00" transparent opacity={0.8} />
                    </lineSegments>
                    <mesh geometry={hoverData.fillGeom}>
                        <meshBasicMaterial color="#00ff00" transparent opacity={0.15} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            )}

            {/* 4. Selection Highlight (Solid Green with Fill) */}
            {selectionData && (
                <group>
                    <lineSegments geometry={selectionData.lineGeom}>
                        <lineBasicMaterial color="#00ff00" linewidth={2} />
                    </lineSegments>
                    <mesh geometry={selectionData.fillGeom}>
                        <meshBasicMaterial color="#00ff00" transparent opacity={0.2} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            )}
        </group>
    );
}
