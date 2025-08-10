'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { GeometryData } from '@/types/geometry';
import { GeometryParser, ParsedGeometry } from '@/utils/geometry-parser';

interface GeometryViewerProps {
  geometryData: GeometryData;
  faceVisibility: boolean[];
  faceColors: string[];
}

function FaceMesh({ 
  vertices, 
  normals, 
  color, 
  alpha, 
  visible, 
  faceIndex,
  indices 
}: { 
  vertices: number[];
  normals: number[];
  color: string;
  alpha: number;
  visible: boolean;
  faceIndex: number;
  indices?: number[];
}) {
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    if (indices) {
      geom.setIndex(indices);
    }
    return geom;
  }, [vertices, normals, indices]);

  return (
    <mesh geometry={geometry} visible={visible} userData={{ faceIndex }}>
      <meshPhongMaterial
        color={color}
        side={THREE.DoubleSide}
        transparent={alpha < 1.0}
        opacity={alpha}
      />
    </mesh>
  );
}

function WireframeMesh({ edges, color = '#333333' }: { edges: number[]; color?: string }) {
  const geometry = useMemo(() => {
    if (!edges || edges.length === 0) return null;
    
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(edges, 3));
    return geom;
  }, [edges]);

  if (!geometry) return null;

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} linewidth={2} />
    </lineSegments>
  );
}

function GeometryScene({ 
  geometryData, 
  faceVisibility, 
  faceColors 
}: { 
  geometryData: GeometryData;
  faceVisibility: boolean[];
  faceColors: string[];
}) {
  const [parsedGeometry, setParsedGeometry] = useState<ParsedGeometry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setError(null);
      console.log('Parsing geometry data in viewer:', geometryData);
      const parsed = GeometryParser.parse(geometryData);
      console.log('Parsed geometry result:', parsed);
      setParsedGeometry(parsed);
    } catch (err) {
      console.error('Failed to parse geometry:', err);
      setError(err instanceof Error ? err.message : 'Unknown parsing error');
      // Set fallback geometry
      const fallback = GeometryParser.parse({});
      console.log('Using fallback geometry:', fallback);
      setParsedGeometry(fallback);
    }
  }, [geometryData]);

  if (!parsedGeometry) {
    console.log('No parsed geometry, showing loading cube');
    return (
      <group>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshPhongMaterial color="#cccccc" transparent opacity={0.5} />
        </mesh>
        <axesHelper args={[2]} />
      </group>
    );
  }

  console.log('Rendering parsed geometry with', parsedGeometry.parts.length, 'parts');

  // Calculate global face index for rendering
  let globalFaceIndex = 0;
  return (
    <group>
      {/* Render all parts */}
      {parsedGeometry.parts.map((part, partIndex) => (
        <group key={`part-${partIndex}`} userData={{ partId: part.id, partName: part.name }}>
          {/* Render face meshes */}
          {part.meshes.map((mesh, meshIndex) => {
            // Use sequential global face index
            const currentFaceIndex = globalFaceIndex++;
            const isVisible = faceVisibility[currentFaceIndex] !== false;
            const faceColor = faceColors[currentFaceIndex] || mesh.color;
            
            return (
              <FaceMesh
                key={`face-${partIndex}-${meshIndex}`}
                vertices={mesh.vertices}
                normals={mesh.normals}
                indices={mesh.indices}
                color={faceColor}
                alpha={mesh.alpha}
                visible={isVisible}
                faceIndex={currentFaceIndex}
              />
            );
          })}
          
          {/* Render wireframe */}
          {part.edges.length > 0 && (
            <WireframeMesh edges={part.edges} color={part.wireframeColor} />
          )}
        </group>
      ))}
      
      {/* Add coordinate system helper */}
      <axesHelper args={[1]} />
      
      {/* Show error message if parsing failed */}
      {error && (
        <group position={[0, 2, 0]}>
          <mesh>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
        </group>
      )}
      
      {/* Show parsing info for debugging */}
      {parsedGeometry && (
        <group position={[0, -2, 0]} visible={false}>
          <meshBasicMaterial color="#ff0000" />
        </group>
      )}
    </group>
  );
}
export default function GeometryViewer({ geometryData, faceVisibility, faceColors }: GeometryViewerProps) {
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([2, 2, 2]);
  
  // Auto-adjust camera based on geometry bounds
  useEffect(() => {
    try {
      console.log('Auto-adjusting camera for geometry:', geometryData);
      const parsed = GeometryParser.parse(geometryData);
      const { size, center } = parsed.boundingBox;
      const maxDimension = Math.max(size.x, size.y, size.z);
      const distance = Math.max(maxDimension * 2, 2); // Minimum distance of 2
      
      console.log('Camera adjustment:', { size, center, maxDimension, distance });
      
      setCameraPosition([
        center.x + distance,
        center.y + distance,
        center.z + distance
      ]);
    } catch (error) {
      console.warn('Could not auto-adjust camera:', error);
      setCameraPosition([2, 2, 2]); // Fallback position
    }
  }, [geometryData]);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: cameraPosition, fov: 75 }}
        shadows
        className="w-full h-full"
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Environment and background */}
        <Environment preset="studio" background />
        
        {/* Grid helper */}
        <Grid
          args={[10, 10]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#6f6f6f"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#9d4b4b"
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />

        {/* Geometry */}
        <GeometryScene
          geometryData={geometryData}
          faceVisibility={faceVisibility}
          faceColors={faceColors}
        />

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          dampingFactor={0.05}
          enableDamping={true}
          minDistance={0.5}
          maxDistance={50}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
        />
      </Canvas>
      
      {/* Controls Help */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded-lg">
        <div className="space-y-1">
          <div><strong>Left Click + Drag:</strong> Rotate</div>
          <div><strong>Right Click + Drag:</strong> Pan</div>
          <div><strong>Mouse Wheel:</strong> Zoom</div>
          <div><strong>Touch:</strong> 1 finger rotate, 2 finger zoom/pan</div>
        </div>
      </div>
      
      {/* Debug Info */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
        <div>Camera: [{cameraPosition.map(p => p.toFixed(1)).join(', ')}]</div>
      </div>
    </div>
  );
}