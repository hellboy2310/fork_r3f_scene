
'use client'

import React from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { NavigationToolbar } from './navigation-toolbar'
import { useEffect, useMemo, useState } from 'react'
import { ThemeToggle } from './theme-toggle'
import { ViewPanel } from './view-panel'
import controls from '@/constants/controls'
import { CanvasProvider } from '@/contexts/CanvasContext'
import Experience from './Experience'
import { ControlPanel } from './control-panel'
import { sampleBox, sampleSquarePyramid, sampleTriangularPrism, box } from '@/constants/constants'
import { GeometryParser } from '@/utils/geometry-parser'
import { GeometryData } from '@/types/geometry'

export function SimpleCanvas(): React.ReactElement {
  // Keyboard controls for shortcut key

  const [useOrtho, setUseOrtho] = useState<boolean>(false)
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([3, 3, 3])
  const [isTransform, setIsTransform] = useState<boolean>(false)
  const [isChangePivot, setIsChangePivot] = useState<boolean>(false)
  const [selectedBox, setSelectedBox] = useState<string>('');
  
  // Face state
  const [faceVisibility, setFaceVisibility] = useState<boolean[]>([]);
  const [faceColors, setFaceColors] = useState<string[]>([]);
  
  // Edge state
  const [edgeVisibility, setEdgeVisibility] = useState<boolean[]>([]);
  const [edgeColors, setEdgeColors] = useState<string[]>([]);
  const [highlightedEdges, setHighlightedEdges] = useState<boolean[]>([]);
  
  // Vertex state
  const [vertexVisibility, setVertexVisibility] = useState<boolean[]>([]);
  const [vertexColors, setVertexColors] = useState<string[]>([]);
  const [highlightedVertices, setHighlightedVertices] = useState<boolean[]>([]);
  
  const map = useMemo(
    () => [
      { name: controls.FRONT, keys: ["1"] },
      { name: controls.BACK, keys: ["6"] },
      { name: controls.LEFT, keys: ["4"] },
      { name: controls.RIGHT, keys: ["3"] },
      { name: controls.BOTTOM, keys: ["5"] },
      { name: controls.TOP, keys: ["2"] },
      { name: controls.ORTHO, keys: ["0"] },
      { name: controls.TRANSFORM, keys: ["m"] }, 
    ],
    []
  )

  const geometryData: GeometryData | undefined =
    selectedBox === 'box1' ? sampleBox :
    selectedBox === 'box2' ? sampleTriangularPrism :
    selectedBox === 'box3' ? sampleSquarePyramid :
    selectedBox === 'box4' ? box :
    undefined

  useEffect(() => {
    if (!geometryData) {
      setFaceVisibility([]);
      setFaceColors([]);
      setEdgeVisibility([]);
      setEdgeColors([]);
      setHighlightedEdges([]);
      setVertexVisibility([]);
      setVertexColors([]);
      setHighlightedVertices([]);
      return;
    }

    try {
      const parsed = GeometryParser.parse(geometryData);
      const faceCount = parsed.stats.totalFaces;
      const edgeCount = parsed.stats.totalEdges;
      const vertexCount = parsed.stats.totalVertices;

      // Initialize face state
      setFaceVisibility(new Array(faceCount).fill(true));
      const defaultFaceColor = parsed.parts.length && parsed.parts[0].meshes.length
        ? parsed.parts[0].meshes[0].color
        : '#e8b024';
      setFaceColors(new Array(faceCount).fill(defaultFaceColor));

      // Initialize edge state
      setEdgeVisibility(new Array(edgeCount).fill(true));
      setEdgeColors(new Array(edgeCount).fill('#333333')); // Default edge color
      setHighlightedEdges(new Array(edgeCount).fill(false));

      // Initialize vertex state
      setVertexVisibility(new Array(vertexCount).fill(true));
      setVertexColors(new Array(vertexCount).fill('#ff0000')); // Default vertex color
      setHighlightedVertices(new Array(vertexCount).fill(false));

    } catch {
      setFaceVisibility([]);
      setFaceColors([]);
      setEdgeVisibility([]);
      setEdgeColors([]);
      setHighlightedEdges([]);
      setVertexVisibility([]);
      setVertexColors([]);
      setHighlightedVertices([]);
    }
  }, [geometryData]);

  return (
    <CanvasProvider>
    <KeyboardControls map={map}>
      <div className="w-full h-full">
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <select
            value={selectedBox}
            onChange={e => setSelectedBox(e.target.value)}
            className="px-3 py-1 rounded border border-gray-300 bg-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select a model
            </option>
            <option value="box1">box1</option>
            <option value="box2">box2</option>
            <option value="box3">box3</option>
            <option value="box4">box4</option>

          </select>
        </div>
        <Canvas>
          <Experience useOrtho={useOrtho} 
            cameraPosition={cameraPosition} 
            isTransform={isTransform} 
            isChangePivot={isChangePivot} 
            setIsChangePivot={setIsChangePivot}  
            faceVisibility={faceVisibility} 
            faceColors={faceColors} 
            geometryData={geometryData!}
            edgeVisibility={edgeVisibility}
            edgeColors={edgeColors}
            highlightedEdges={highlightedEdges}
            vertexVisibility={vertexVisibility}
            vertexColors={vertexColors}
            highlightedVertices={highlightedVertices}
          />
        </Canvas>
        <NavigationToolbar 
          setCameraPosition={setCameraPosition} 
          setUseOrtho={setUseOrtho} 
          isTransform={isTransform} 
          isChangePivot={isChangePivot} 
          setIsTransform={setIsTransform} 
          setIsChangePivot={setIsChangePivot}  
        />
          <ViewPanel />
          <ThemeToggle />
        <ControlPanel  
          geometryData={geometryData} 
          faceVisibility={faceVisibility} 
          faceColors={faceColors} 
          onFaceVisibilityChange={setFaceVisibility} 
          onFaceColorsChange={setFaceColors}
          edgeVisibility={edgeVisibility}
          edgeColors={edgeColors}
          highlightedEdges={highlightedEdges}
          onEdgeVisibilityChange={setEdgeVisibility}
          onEdgeColorsChange={setEdgeColors}
          onHighlightedEdgesChange={setHighlightedEdges}
          vertexVisibility={vertexVisibility}
          vertexColors={vertexColors}
          highlightedVertices={highlightedVertices}
          onVertexVisibilityChange={setVertexVisibility}
          onVertexColorsChange={setVertexColors}
          onHighlightedVerticesChange={setHighlightedVertices}
        />
      </div>
    </KeyboardControls>
    </CanvasProvider>
  )
}