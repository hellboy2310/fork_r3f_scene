"use client"

import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { X, Menu, CornerDownLeft, ChevronDown, ChevronRight, Eye, Zap, MapPin, Triangle, EyeOff } from "lucide-react"
import {
  Box,
  Grid3X3,
  Play,
  BarChart3,
} from "lucide-react"
import { Rnd } from 'react-rnd'
import Link from 'next/link'
import { GeometryData, GeometryStats } from "@/types/geometry"
import { GeometryParser, ParsedGeometry } from "@/utils/geometry-parser"

type Project = {
  id: number
  name: string
  slug: string
  description: string | null
  status: string
  relativePath: string
  createdAt: Date
  updatedAt: Date
}

type ControlPanelProps = {
  project?: Project | null;
  geometryData?: GeometryData;
  faceVisibility?: boolean[];
  faceColors?: string[];
  onFaceVisibilityChange?: (v: boolean[]) => void;
  onFaceColorsChange?: (c: string[]) => void;
}

const controlSections = [
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

export function ControlPanel({ project, geometryData, faceVisibility = [], faceColors = [], onFaceVisibilityChange, onFaceColorsChange}: ControlPanelProps) {
  const isMobile = useIsMobile()
  const [isExpanded, setIsExpanded] = useState(true)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "Geometry": true, // Default open based on isActive
    "Mesh": false,
    "Simulation": false,
    "Analysis": false,
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
        try {
          console.log('Parsing geometry data in hierarchy:', geometryData);
          const parsed = GeometryParser.parse(geometryData);
          console.log('Parsed geometry result:', parsed);
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
            if(onFaceVisibilityChange){

              onFaceVisibilityChange(new Array(newStats.faces).fill(true));
            }
          }
          if (faceColors.length === 0) {
            // Get default color from first part
            const defaultColor =
              parsed.parts.length > 0 && parsed.parts[0].meshes.length > 0
                ? parsed.parts[0].meshes[0].color
                : '#e8b024';
                if(onFaceColorsChange){
                  onFaceColorsChange(new Array(newStats.faces).fill(defaultColor));
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
            if(onFaceVisibilityChange){
            onFaceVisibilityChange(new Array(6).fill(true));
            }
          }
          if (faceColors.length === 0) {
            if(onFaceColorsChange){
              
              onFaceColorsChange(new Array(6).fill('#e8b024'));
            }
          }
        }
      }, [
        geometryData,
        faceVisibility.length,
        faceColors.length,
        onFaceVisibilityChange,
        onFaceColorsChange,
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

  // Function to change face color
  const changeFaceColor = (index: number, color: string) => {
    const newColors = [...faceColors];
    newColors[index] = color;
    if(onFaceColorsChange){
      onFaceColorsChange(newColors);
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

  const SectionHeader = ({
    title,
    icon: Icon,
    count,
    isExpanded,
    onToggle,
  }: {
    title: string;
    icon: any;
    count: number;
    isExpanded: boolean;
    onToggle: () => void;
  }) => (
    <div
      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer select-none"
      onClick={onToggle}
    >
      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      <Icon size={16} className="text-blue-600" />
      <span className="text-sm font-medium text-gray-700">{title}</span>
      <span className="text-xs text-gray-500 ml-auto">({count})</span>
      <Eye size={14} className="text-gray-400" />
    </div>
  );

  // Update expanded state based on mobile/desktop on mount
  useEffect(() => {
    setIsExpanded(!isMobile)
  }, [isMobile])

    let parsed;
  try {
    parsed = geometryData ? GeometryParser.parse(geometryData) : null;
  } catch {
    parsed = null;
  }

  let globalFaceIndex = 0;


  if (!isExpanded) {
    return (
      <Rnd
        default={{
          x: 16,
          y: 16,
          width: 40,
          height: 40,
        }}
        enableResizing={false}
        bounds="parent"
        dragHandleClassName="drag-handle"
        style={{ zIndex: 100 }}
      >
        <button
          onClick={() => setIsExpanded(true)}
          className="w-10 h-10 rounded-full shadow-lg text-primary hover:bg-primary hover:text-primary-foreground drag-handle cursor-move border border-border flex items-center justify-center transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </Rnd>
    )
  }

  return (
    <Rnd
      default={{
        x: 16,
        y: 16,
        width: 320,
        height: 600,
      }}
      minWidth={250}
      minHeight={200}
      maxWidth={600}
      maxHeight={800}
      bounds="parent"
      dragHandleClassName="drag-handle"
      style={{ zIndex: 100 }}
    >
      <div className="w-full h-full shadow-lg relative flex flex-col border border-border bg-card rounded-lg">
        <div className="drag-handle cursor-move p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 flex items-center gap-2">
              {project && (
                <Link href="/dashboard" className="p-1 hover:bg-accent rounded transition-colors">
                  <CornerDownLeft className="h-4 w-4" />
                </Link>
              )}
              <h3 className="text-sm font-medium">
                {project ? project.name : 'Control Panel'}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-3 right-3 h-6 w-6 hover:bg-accent rounded transition-colors flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-0 flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <div className="px-4 pb-4">
              <div className="space-y-1">
                {controlSections.map((section) => (
                  <div key={section.title}>
                    <button
                      className="w-full px-2 py-2 hover:bg-accent rounded-md flex items-center justify-between transition-colors"
                      onClick={() => setOpenSections(prev => ({...prev, [section.title]: !prev[section.title]}))}
                    >
                      <div className="flex items-center">
                        <section.icon className="h-4 w-4 mr-2" />
                        <span className="text-left font-medium">{section.title}</span>
                      </div>
                      <span className={`transform transition-transform ${openSections[section.title] ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {openSections[section.title] && (
                      <div className="pl-6 space-y-1 pb-2">
                        {section.items.map((item) => (
                          <a
                            key={item.title}
                            href={item.url}
                            className="w-full justify-start px-2 py-1.5 h-auto text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors block"
                          >
                            {item.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                 <div className="p-4 h-full overflow-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Scene Hierarchy</h2>

      {/* Geometry Statistics */}
    
       

      <div className="space-y-1">
        {/* Workplane Section */}
        <SectionHeader
          title="Workplane(Solid)"
          icon={Box}
          count={1}
          isExpanded={expandedSections.workplane}
          onToggle={() => toggleSection('workplane')}
        />

        {expandedSections.workplane && (
          <div className="ml-4 space-y-1">
            {/* Faces Section */}
            <SectionHeader
              title="faces"
              icon={Box}
              count={stats.faces}
              isExpanded={expandedSections.faces}
              onToggle={() => toggleSection('faces')}
            />

            {expandedSections.faces && (
              <div className="ml-4 space-y-1">
                {parsedGeometry?.parts.map((part, partIndex) =>
                  part.meshes.map((mesh, meshIndex) => {
                    const currentFaceIndex = globalFaceIndex++;
                    return (
                      <div
                        key={`face-${partIndex}-${meshIndex}`}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm"
                      >
                        <Triangle size={14} className="text-green-600" />
                        <span className="text-gray-700">faces_{currentFaceIndex}</span>
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            onClick={() => toggleFaceVisibility(currentFaceIndex)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title={faceVisibility[currentFaceIndex] ? 'Hide face' : 'Show face'}
                          >
                            {faceVisibility[currentFaceIndex] ? (
                              <Eye size={14} className="text-gray-600" />
                            ) : (
                              <EyeOff size={14} className="text-gray-400" />
                            )}
                          </button>
                          <input
                            type="color"
                            value={faceColors[currentFaceIndex] || '#e8b024'}
                            onChange={(e) => changeFaceColor(currentFaceIndex, e.target.value)}
                            className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                            title="Change face color"
                          />
                          <span className="text-xs text-green-600 cursor-pointer hover:underline">
                            Click to color
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Edges Section */}
            <SectionHeader
              title="edges"
              icon={Triangle}
              count={stats.edges}
              isExpanded={expandedSections.edges}
              onToggle={() => toggleSection('edges')}
            />

            {expandedSections.edges && (
              <div className="ml-4 text-sm text-gray-600 px-3 py-2">
                <div className="space-y-1">
                  {Array.from({ length: stats.edges }, (_, i) => (
                    <div key={`edge-${i}`} className="flex items-center gap-2">
                      <Triangle size={12} className="text-orange-500" />
                      <span>edge_{i}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vertices Section */}
            <SectionHeader
              title="vertices"
              icon={MapPin}
              count={stats.vertices}
              isExpanded={expandedSections.vertices}
              onToggle={() => toggleSection('vertices')}
            />

            {expandedSections.vertices && (
              <div className="ml-4 text-sm text-gray-600 px-3 py-2">
                <div className="space-y-1">
                  {getCornerVertices().map((vertex, i) => (
                    <div key={`vertex-${i}`} className="flex items-center gap-2">
                      <MapPin size={12} className="text-purple-500" />
                      <span>
                        vertex_{i} ({vertex.x}, {vertex.y}, {vertex.z})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Normals Section */}
            <SectionHeader
              title="normals"
              icon={Zap}
              count={stats.faces}
              isExpanded={expandedSections.normals}
              onToggle={() => toggleSection('normals')}
            />

            {expandedSections.normals && (
              <div className="ml-4 text-sm text-gray-600 px-3 py-2">
                <div className="space-y-1">
                  {Array.from({ length: stats.faces }, (_, i) => (
                    <div key={`normal-${i}`} className="flex items-center gap-2">
                      <Zap size={12} className="text-red-500" />
                      <span>normal_{i}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Rnd>
  )
}