'use client'

import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { X, CornerDownLeft, ChevronDown, Eye, Zap, MapPin, Triangle, EyeOff, PanelLeftClose, ChevronRight, Box, Grid3X3, Play, BarChart3, Menu, Grip } from "lucide-react"
import Link from 'next/link'
import { GeometryData, GeometryStats } from "@/types/geometry"
import { GeometryParser, ParsedGeometry } from "@/utils/geometry-parser"
import { Rnd } from 'react-rnd'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { is } from "@react-three/fiber/dist/declarations/src/core/utils"


type ControlPanelProps = {
  x?: number
  y?: number
  width?: number
  height?: number
  heightOffset?: number
  geometryData?: GeometryData;
  faceVisibility?: boolean[];
  faceColors?: string[];
  onFaceVisibilityChange?: (v: boolean[]) => void;
  onFaceColorsChange?: (c: string[]) => void;
  edgeVisibility?: boolean[];
  edgeColors?: string[];
  highlightedEdges?: boolean[];
  onEdgeVisibilityChange?: (v: boolean[]) => void;
  onEdgeColorsChange?: (c: string[]) => void;
  onHighlightedEdgesChange?: (h: boolean[]) => void;
  vertexVisibility?: boolean[];
  vertexColors?: string[];
  highlightedVertices?: boolean[];
  onVertexVisibilityChange?: (v: boolean[]) => void;
  onVertexColorsChange?: (c: string[]) => void;
  onHighlightedVerticesChange?: (h: boolean[]) => void;
}


const ControlPanelSections = [
  {
    title: "Geometry",
    icon: Box,
    isActive: true,
    items: [
      { title: "Import CAD", url: "#" },
      { title: "Create Geometry", url: "#" },
      { title: "Edit Geometry", url: "#" },
      { title: "View 3D", url: "#" },
    ],
  },
  {
    title: "Mesh",
    icon: Grid3X3,
    items: [
      { title: "Generate Mesh", url: "#" },
      { title: "Mesh Quality", url: "#" },
      { title: "Refinement", url: "#" },
      { title: "Boundary Conditions", url: "#" },
    ],
  },
  {
    title: "Simulation",
    icon: Play,
    items: [
      { title: "Material Properties", url: "#" },
      { title: "Load Conditions", url: "#" },
      { title: "Solver Settings", url: "#" },
      { title: "Run Analysis", url: "#" },
    ],
  },
  {
    title: "Analysis",
    icon: BarChart3,
    items: [
      { title: "Displacement", url: "#" },
      { title: "Stress", url: "#" },
      { title: "Strain", url: "#" },
      { title: "Export Data", url: "#" },
    ],
  },
]

export function ControlPanel({
  x = 16,
  y = 16,
  width = 300,
  height,
  heightOffset = 500,
  geometryData,
  faceVisibility = [],
  faceColors = [],
  onFaceVisibilityChange,
  onFaceColorsChange,
  edgeVisibility = [],
  edgeColors = [],
  highlightedEdges = [],
  onEdgeVisibilityChange,
  onEdgeColorsChange,
  onHighlightedEdgesChange,
  vertexVisibility = [],
  vertexColors = [],
  highlightedVertices = [],
  onVertexVisibilityChange,
  onVertexColorsChange,
  onHighlightedVerticesChange
}: ControlPanelProps) {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(true)
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800)
  const calculatedHeight = height ?? windowHeight - heightOffset
  const [isExpanded, setIsExpanded] = useState(true)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "Geometry": true,
    "Mesh": false,
    "Simulation": false,
    "Analysis": false,
    "Scene Hierarchy": true,
  })
  const [expandedSections, setExpandedSections] = useState({
    workplane: true,
    parts: true,
    faces: true,
    edges: false,
    vertices: false,
    normals: false,
  });
  const [parsedGeometry, setParsedGeometry] = useState<ParsedGeometry | null>(null);
  const [stats, setStats] = useState<GeometryStats>({
    faces: 0,
    edges: 0,
    vertices: 0,
    triangles: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    try {
      const parsed = GeometryParser.parse(geometryData);
      setParsedGeometry(parsed);

      const newStats: GeometryStats = {
        faces: parsed.stats.totalFaces,
        edges: parsed.stats.totalEdges,
        vertices: parsed.stats.totalVertices,
        triangles: parsed.stats.totalTriangles,
      };
      setStats(newStats);

      // Initialize visibility and colors arrays
      if (faceVisibility.length === 0) {
        if (onFaceVisibilityChange) {
          onFaceVisibilityChange(new Array(newStats.faces).fill(true));
        }
      }
      if (faceColors.length === 0) {
        // Get default color from first part
        const defaultColor =
          parsed.parts.length > 0 && parsed.parts[0].meshes.length > 0
            ? parsed.parts[0].meshes[0].color
            : '#e8b024';
        if (onFaceColorsChange) {
          onFaceColorsChange(new Array(newStats.faces).fill(defaultColor));
        }
      }

      // Initialize edge arrays
      if (edgeVisibility.length === 0) {
        if (onEdgeVisibilityChange) {
          onEdgeVisibilityChange(new Array(newStats.edges).fill(true));
        }
      }
      if (edgeColors.length === 0) {
        if (onEdgeColorsChange) {
          onEdgeColorsChange(new Array(newStats.edges).fill('#333333'));
        }
      }
      if (highlightedEdges.length === 0) {
        if (onHighlightedEdgesChange) {
          onHighlightedEdgesChange(new Array(newStats.edges).fill(false));
        }
      }

      // Initialize vertex arrays
      if (vertexVisibility.length === 0) {
        if (onVertexVisibilityChange) {
          onVertexVisibilityChange(new Array(newStats.vertices).fill(true));
        }
      }
      if (vertexColors.length === 0) {
        if (onVertexColorsChange) {
          onVertexColorsChange(new Array(newStats.vertices).fill('#ff0000'));
        }
      }
      if (highlightedVertices.length === 0) {
        if (onHighlightedVerticesChange) {
          onHighlightedVerticesChange(new Array(newStats.vertices).fill(false));
        }
      }

    } catch (error) {
      console.error('Error calculating stats:', error);

      // Fallback stats
      const fallbackStats: GeometryStats = {
        faces: 6,
        edges: 12,
        vertices: 8,
        triangles: 12,
      };
      setStats(fallbackStats);

      if (faceVisibility.length === 0) {
        if (onFaceVisibilityChange) {
          onFaceVisibilityChange(new Array(6).fill(true));
        }
      }
      if (faceColors.length === 0) {
        if (onFaceColorsChange) {
          onFaceColorsChange(new Array(6).fill('#e8b024'));
        }
      }
    }
  }, [
    geometryData,
    faceVisibility.length,
    faceColors.length,
    edgeVisibility.length,
    edgeColors.length,
    highlightedEdges.length,
    vertexVisibility.length,
    vertexColors.length,
    highlightedVertices.length,
    onFaceVisibilityChange,
    onFaceColorsChange,
    onEdgeVisibilityChange,
    onEdgeColorsChange,
    onHighlightedEdgesChange,
    onVertexVisibilityChange,
    onVertexColorsChange,
    onHighlightedVerticesChange,
  ]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleFaceVisibility = (index: number) => {
    const newVis = [...faceVisibility];
    newVis[index] = !newVis[index];
    if (onFaceVisibilityChange) {
      onFaceVisibilityChange(newVis);
    }
  };

  const changeFaceColor = (index: number, color: string) => {
    const newColors = [...faceColors];
    newColors[index] = color;
    if (onFaceColorsChange) {
      onFaceColorsChange(newColors);
    }
  };

  const toggleEdgeVisibility = (index: number) => {
    const newVis = [...edgeVisibility];
    newVis[index] = !newVis[index];
    if (onEdgeVisibilityChange) {
      onEdgeVisibilityChange(newVis);
    }
  };

  const changeEdgeColor = (index: number, color: string) => {
    const newColors = [...edgeColors];
    newColors[index] = color;
    if (onEdgeColorsChange) {
      onEdgeColorsChange(newColors);
    }
  };

  const toggleEdgeHighlight = (index: number) => {
    const newHighlighted = [...highlightedEdges];
    newHighlighted[index] = !newHighlighted[index];
    if (onHighlightedEdgesChange) {
      onHighlightedEdgesChange(newHighlighted);
    }
  };

  const toggleVertexVisibility = (index: number) => {
    const newVis = [...vertexVisibility];
    newVis[index] = !newVis[index];
    if (onVertexVisibilityChange) {
      onVertexVisibilityChange(newVis);
    }
  };

  const changeVertexColor = (index: number, color: string) => {
    const newColors = [...vertexColors];
    newColors[index] = color;
    if (onVertexColorsChange) {
      onVertexColorsChange(newColors);
    }
  };

  const toggleVertexHighlight = (index: number) => {
    const newHighlighted = [...highlightedVertices];
    newHighlighted[index] = !newHighlighted[index];
    if (onHighlightedVerticesChange) {
      onHighlightedVerticesChange(newHighlighted);
    }
  };

  const getCornerVertices = () => {
    try {
      if (!parsedGeometry) return [];
      const corners: Array<{ x: number; y: number; z: number; index: number }> = [];
      // Get unique vertices from all parts
      const uniqueVertices = new Map<string, { x: number; y: number; z: number; index: number }>();
      let vertexIndex = 0;
      parsedGeometry.parts.forEach((part) => {
        part.meshes.forEach((mesh) => {
          for (let i = 0; i < mesh.vertices.length; i += 3) {
            const x = parseFloat(mesh.vertices[i].toFixed(3));
            const y = parseFloat(mesh.vertices[i + 1].toFixed(3));
            const z = parseFloat(mesh.vertices[i + 2].toFixed(3));
            const key = `${x},${y},${z}`;
            if (!uniqueVertices.has(key)) {
              uniqueVertices.set(key, { x, y, z, index: vertexIndex++ });
            }
          }
        });
      });
      return Array.from(uniqueVertices.values()).slice(0, 20); // Limit to first 20 for performance
    } catch (error) {
      console.error('Error getting vertices:', error);
      return [];
    }
  };

  const toggleAllFacesVisibility = () => {
    const allVisible = faceVisibility.every(v => v);
    const newVis = new Array(stats.faces).fill(!allVisible);
    if (onFaceVisibilityChange) onFaceVisibilityChange(newVis);
  };

  const toggleAllEdgesVisibility = () => {
    const allVisible = edgeVisibility.every(v => v);
    const newVis = new Array(stats.edges).fill(!allVisible);
    if (onEdgeVisibilityChange) onEdgeVisibilityChange(newVis);
  };

  const toggleAllVerticesVisibility = () => {
    const allVisible = vertexVisibility.every(v => v);
    const newVis = new Array(stats.vertices).fill(!allVisible);
    if (onVertexVisibilityChange) onVertexVisibilityChange(newVis);
  };


  const SectionHeader = ({
    title,
    icon: Icon,
    count,
    isExpanded,
    onToggle,
    isAllVisible,
    onToggleVisibility
  }: {
    title: string;
    icon: any;
    count: number;
    isExpanded: boolean;
    onToggle: () => void;
    isAllVisible?: boolean;
    onToggleVisibility?: () => void;
  }) => (
    <div
      className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none"
      onClick={onToggle}
    >
      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      <Icon size={16} className="text-blue-600" />
      <span className="text-sm font-medium">{title}</span>
      <span className="text-xs text-gray-500 ml-auto">({count})</span>
      {onToggleVisibility && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // so clicking eye doesn’t expand/collapse
            onToggleVisibility();
          }}
          className="p-1 rounded hover:bg-accent"
        >
          {isAllVisible ? (
            <Eye size={14} className="text-gray-600" />
          ) : (
            <EyeOff size={14} className="text-gray-400" />
          )}
        </button>
      )}
    </div>
  );





  let parsed;
  try {
    parsed = geometryData ? GeometryParser.parse(geometryData) : null;
  } catch {
    parsed = null;
  }

  let globalFaceIndex = 0;

  if (!isVisible || !isExpanded) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 left-4 p-2 bg-card border rounded-lg shadow-lg hover:bg-muted/50 transition-colors z-50"
      >
        <Menu className="h-4 w-4 text-muted-foreground" />
      </button>
    )
  }
  return (
    <Rnd
      default={{ x, y, width, height: calculatedHeight }}
      enableResizing={{
        bottomRight: true,
      }}
      dragHandleClassName="drag-handle"
      style={{ zIndex: 100 }}
    >
<div className="h-full w-full bg-card/50 border rounded-lg shadow-lg backdrop-blur-sm">
        <div className="h-8 bg-muted/30 rounded-t-lg border-b px-3 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Control Panel</span>

          <div className="drag-handle cursor-move px-3 py-1 hover:bg-muted/50 rounded transition-colors flex items-center justify-center">
            <Grip className="h-4 w-4 text-muted-foreground/60 hover:text-muted-foreground" />
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-muted/50 rounded transition-colors"
          >
            <PanelLeftClose className="h-4 w-4 text-muted-foreground/60" />
          </button>
        </div>

        <div className="p-4 h-[calc(100%-2rem)] overflow-auto space-y-2">
          {/* === Scene Hierarchy (integrated as a Collapsible) === */}
          <Collapsible
            open={!!openSections["Scene Hierarchy"]}
            onOpenChange={(open) =>
              setOpenSections((prev) => ({ ...prev, "Scene Hierarchy": open }))
            }
            className="group/collapsible"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full rounded px-2 py-1.5 hover:bg-muted/40">
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4" />
                <span className="text-sm font-medium">Scene Hierarchy</span>
              </div>
              <ChevronRight className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="pl-4 space-y-2 pt-2">
                {/* Workplane */}
                <SectionHeader
                  title="Workplane(Solid)"
                  icon={Box}
                  count={1}
                  isExpanded={expandedSections.workplane}
                  onToggle={() => toggleSection("workplane")}
                />

                {expandedSections.workplane && (
                  <div className="ml-4 space-y-2">
                    {/* Faces */}
                    <SectionHeader
                      title="faces"
                      icon={Box}
                      count={stats.faces}
                      isExpanded={expandedSections.faces}
                      onToggle={() => toggleSection("faces")}
                      isAllVisible={faceVisibility.every((v) => v)}
                      onToggleVisibility={toggleAllFacesVisibility}
                    />

                    {expandedSections.faces && (
                      <div className="ml-4 space-y-1">
                        {parsedGeometry?.parts.map((part, partIndex) =>
                          part.meshes.map((mesh, meshIndex) => {
                            const currentFaceIndex = globalFaceIndex++;
                            return (
                              <div
                                key={`face-${partIndex}-${meshIndex}`}
                                className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted/30"
                              >
                                <Triangle size={14} className="text-green-600" />
                                <span className="text-foreground">
                                  faces_{currentFaceIndex}
                                </span>

                                <div className="ml-auto flex items-center gap-2">
                                  <button
                                    onClick={() => toggleFaceVisibility(currentFaceIndex)}
                                    className="p-1 rounded hover:bg-muted/40"
                                    title={faceVisibility[currentFaceIndex] ? "Hide face" : "Show face"}
                                  >
                                    {faceVisibility[currentFaceIndex] ? (
                                      <Eye size={14} className="text-gray-600" />
                                    ) : (
                                      <EyeOff size={14} className="text-gray-400" />
                                    )}
                                  </button>

                                  <input
                                    type="color"
                                    value={faceColors[currentFaceIndex] || "#e8b024"}
                                    onChange={(e) =>
                                      changeFaceColor(currentFaceIndex, e.target.value)
                                    }
                                    className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                                    title="Change face color"
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}

                    {/* Edges */}
                    <SectionHeader
                      title="edges"
                      icon={Triangle}
                      count={stats.edges}
                      isExpanded={expandedSections.edges}
                      onToggle={() => toggleSection("edges")}
                      isAllVisible={edgeVisibility.every((v) => v)}
                      onToggleVisibility={toggleAllEdgesVisibility}
                    />

                    {expandedSections.edges && (
                      <div className="ml-4 space-y-1">
                        {Array.from({ length: stats.edges }, (_, i) => (
                          <div
                            key={`edge-${i}`}
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted/30"
                          >
                            <Triangle size={14} className="text-orange-500" />
                            <span className="text-foreground">edge_{i}</span>

                            <div className="ml-auto flex items-center gap-2">
                              <button
                                onClick={() => toggleEdgeVisibility(i)}
                                className="p-1 rounded hover:bg-muted/40"
                                title={edgeVisibility[i] ? "Hide edge" : "Show edge"}
                              >
                                {edgeVisibility[i] ? (
                                  <Eye size={14} className="text-gray-600" />
                                ) : (
                                  <EyeOff size={14} className="text-gray-400" />
                                )}
                              </button>

                              <input
                                type="color"
                                value={edgeColors[i] || "#333333"}
                                onChange={(e) => changeEdgeColor(i, e.target.value)}
                                className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                                title="Change edge color"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Vertices */}
                    <SectionHeader
                      title="vertices"
                      icon={MapPin}
                      count={stats.vertices}
                      isExpanded={expandedSections.vertices}
                      onToggle={() => toggleSection("vertices")}
                      isAllVisible={vertexVisibility.every((v) => v)}
                      onToggleVisibility={toggleAllVerticesVisibility}
                    />

                    {expandedSections.vertices && (
                      <div className="ml-4 space-y-1">
                        {getCornerVertices().map((vertex, i) => (
                          <div
                            key={`vertex-${i}`}
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted/30"
                          >
                            <MapPin size={14} className="text-purple-500" />
                            <span className="text-foreground">vertex_{i}</span>

                            <div className="ml-auto flex items-center gap-2">
                              <button
                                onClick={() => toggleVertexVisibility(i)}
                                className="p-1 rounded hover:bg-muted/40"
                                title={vertexVisibility[i] ? "Hide vertex" : "Show vertex"}
                              >
                                {vertexVisibility[i] ? (
                                  <Eye size={14} className="text-gray-600" />
                                ) : (
                                  <EyeOff size={14} className="text-gray-400" />
                                )}
                              </button>

                              <input
                                type="color"
                                value={vertexColors[i] || "#ff0000"}
                                onChange={(e) => changeVertexColor(i, e.target.value)}
                                className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                                title="Change vertex color"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* === Rest of your dynamic sections === */}
          {ControlPanelSections.map((section) => (
            <Collapsible key={section.title} title={section.title} defaultOpen className="group/collapsible">
              <CollapsibleTrigger className="flex items-center justify-between w-full rounded px-2 py-1.5 hover:bg-muted/40">
                {section.title}
                <ChevronRight className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                {section.items.map((item) => (
                  <a
                    key={item.title}
                    href={item.url}
                    className="w-full justify-start px-2 py-1.5 h-auto text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors block"
                  >
                    {item.title}
                  </a>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>      

    </Rnd>
  );
}
