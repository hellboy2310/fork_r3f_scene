"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { NavigationToolbar } from "./navigation-toolbar";
import { useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { ViewPanel } from "./view-panel";
import controls from "@/constants/controls";
import Experience from "./Experience";
import { CanvasProvider, useCanvas } from "@/contexts/CanvasContext";
import { ControlPanel } from "./control-panel";
import { GeometryParser } from "@/utils/geometry-parser";
import { GeometryData } from "@/types/geometry";
import { fetchGeometry } from "@/services/geometry-service";

// Separate the component that uses the canvas context
function CanvasContent(): React.ReactElement {
  const [selectedBox, setSelectedBox] = useState<string>("box1");

  const {
    useOrtho,
    setUseOrtho,
    cameraPosition,
    setCameraPosition,
    isTransform,
    setIsTransform,
    isChangePivot,
    setIsChangePivot,
    geometryData,
    setGeometryData,
    faceVisibility,
    setFaceVisibility,
    faceColors,
    setFaceColors,
    edgeVisibility,
    setEdgeVisibility,
    edgeColors,
    setEdgeColors,
    highlightedEdges,
    setHighlightedEdges,
    vertexVisibility,
    setVertexVisibility,
    vertexColors,
    setVertexColors,
    highlightedVertices,
    setHighlightedVertices,
  } = useCanvas();

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
  );


  // initialize face/edge/vertex state based on the context geometry
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

      // faces
      setFaceVisibility(new Array(faceCount).fill(true));
      const defaultFaceColor =
        parsed.parts.length && parsed.parts[0].meshes.length
          ? parsed.parts[0].meshes[0].color
          : "#e8b024";
      setFaceColors(new Array(faceCount).fill(defaultFaceColor));

      // edges
      setEdgeVisibility(new Array(edgeCount).fill(true));
      setEdgeColors(new Array(edgeCount).fill("#333333"));
      setHighlightedEdges(new Array(edgeCount).fill(false));

      // vertices
      setVertexVisibility(new Array(vertexCount).fill(true));
      setVertexColors(new Array(vertexCount).fill("#ff0000"));
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
  }, [
    geometryData,
    setFaceVisibility,
    setFaceColors,
    setEdgeVisibility,
    setEdgeColors,
    setHighlightedEdges,
    setVertexVisibility,
    setVertexColors,
    setHighlightedVertices,
  ]);

  useEffect(() => {
    if (!selectedBox) {
      setGeometryData(undefined);
      return;
    }
    // Fetch the geometry data for the selected box
    fetchGeometry(selectedBox)
      .then((data) => {
        setGeometryData(data);
      })
      .catch((err) => {
        setGeometryData(undefined);
      })
  }, [selectedBox]);

  return (
    <KeyboardControls map={map}>
      <div className="w-full h-full">
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <select
            value={selectedBox}
            onChange={(e) => setSelectedBox(e.target.value)}
            className="px-3 py-1 rounded border border-gray-300 bg-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select a model
            </option>
            <option value="box1">box1</option>
            <option value="box2">box2</option>
            <option value="box3">box3</option>
          </select>
        </div>

        <Canvas>
          <Experience />
        </Canvas>

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
  );
}

// Main component that provides the canvas context
export function SimpleCanvas(): React.ReactElement {
  return (
    <CanvasProvider>
      <CanvasContent />
    </CanvasProvider>
  );
}
