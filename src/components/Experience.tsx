

import { GeometryData } from '@/types/geometry'
import { GeometryParser, ParsedGeometry } from '@/utils/geometry-parser'
import { OrbitControls, GizmoHelper, GizmoViewport, OrthographicCamera, PerspectiveCamera, PivotControls, Edges, useKeyboardControls } from '@react-three/drei'
import { ThreeEvent } from '@react-three/fiber'
import { useEffect, 
         useRef, 
         useState, 
         useMemo, 
         Suspense } from 'react'
import * as THREE from 'three'
import Model from './Model'
import { useCanvas } from '@/contexts/CanvasContext'
import controls from '@/constants/controls'



interface ExperienceProps {
    useOrtho: boolean
    cameraPosition: [number, number, number]
    isTransform: boolean
    isChangePivot: boolean
    setIsChangePivot: React.Dispatch<React.SetStateAction<boolean>>
    faceVisibility: boolean[]
    faceColors: string[]
    geometryData: GeometryData
    edgeVisibility: boolean[]
    edgeColors: string[]
    highlightedEdges: boolean[]
    vertexVisibility: boolean[]
    vertexColors: string[]
    highlightedVertices: boolean[]
}

type PivotAnchor = { name: string, position: [number, number, number], rotation: [number, number, number] }

export const pivotData: PivotAnchor[] = [
    {
        "name": "center",
        "position": [0, 0, 0],
        "rotation": [0, Math.PI / 2, 0]
    },
    {
        "name": "corner",
        "position": [-1, -1, -1],
        "rotation": [0, Math.PI * 0, 0]
    },
    {
        "name": "corner",
        "position": [1, -1, -1],
        "rotation": [0, Math.PI * 0, 0]
    },
    {
        "name": "corner",
        "position": [-1, 1, -1],
        "rotation": [0, Math.PI / 2, 0] // done 2
    },
    {
        "name": "corner",
        "position": [1, 1, -1],
        "rotation": [0, Math.PI / 2, 0] // done 3
    },
    {
        "name": "corner",
        "position": [-1, -1, 1],
        "rotation": [0, Math.PI / 2, 0] // done 4
    },
    {
        "name": "corner",
        "position": [1, -1, 1],
        "rotation": [0, Math.PI / 2, 0] // done 5
    },
    {
        "name": "corner",
        "position": [-1, 1, 1],
        "rotation": [0, Math.PI / 2, 0] // done 6
    },
    {
        "name": "corner",
        "position": [1, 1, 1],
        "rotation": [0, Math.PI / 2, 0] // done 7
    },
    {
        "name": "edge",
        "position": [0, -1, -1],
        "rotation": [0, Math.PI * 0, 0]
    },
    {
        "name": "edge",
        "position": [-1, 0, -1],
        "rotation": [0, Math.PI * 0, 0]
    },
    {
        "name": "edge",
        "position": [-1, -1, 0],
        "rotation": [0, Math.PI * 0, 0]
    },
    {
        "name": "edge",
        "position": [1, 0, -1],
        "rotation": [0, Math.PI * 0, 0]
    },
    {
        "name": "edge",
        "position": [1, -1, 0],
        "rotation": [Math.PI, Math.PI / 2, Math.PI / 2] // done 12
    },
    {
        "name": "edge",
        "position": [0, 1, -1],
        "rotation": [Math.PI, Math.PI / 2, Math.PI / 2] // done 13
    },
    {
        "name": "edge",
        "position": [-1, 1, 0],
        "rotation": [Math.PI, Math.PI / 2, Math.PI / 2] // done 14
    },
    {
        "name": "edge",
        "position": [1, 1, 0],
        "rotation": [0, Math.PI * 0, 0]
    },
    {
        "name": "edge",
        "position": [0, -1, 1],
        "rotation": [Math.PI, Math.PI / 2, Math.PI / 2] // done 16
    },
    {
        "name": "edge",
        "position": [-1, 0, 1],
        "rotation": [0, Math.PI / 2, 0] // done 17
    },
    {
        "name": "edge",
        "position": [1, 0, 1],
        "rotation": [0, Math.PI / 2, 0] // done 18
    },
    {
        "name": "edge",
        "position": [0, 1, 1],
        "rotation": [Math.PI, Math.PI / 2, Math.PI / 2] // done 19
    },
    {
        "name": "face",
        "position": [0, 0, 1],
        "rotation": [0, 0, 0] // done 20
    },
    {
        "name": "face",
        "position": [0, 1, 0],
        "rotation": [0, Math.PI / 2, 0] // done 21
    },
    {
        "name": "face",
        "position": [1, 0, 0],
        "rotation": [Math.PI, Math.PI / 2, Math.PI / 2] // done 22
    },
    {
        "name": "face",
        "position": [0, 0, -1],
        "rotation": [0, Math.PI * 0, 0]
    },
    {
        "name": "face",
        "position": [0, -1, 0],
        "rotation": [0, Math.PI * 0, 0]
    },
    {
        "name": "face",
        "position": [-1, 0, 0],
        "rotation": [0, Math.PI * 0, 0]
    },
]

const FaceMesh = ({ 
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
}) => {
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

const WireframeMesh = ({ edges, color = '#333333', edgeIndex, visible = true, highlighted = false }: { edges: number[]; color?: string; edgeIndex: number; visible?: boolean; highlighted?: boolean}) => {
  const geometry = useMemo(() => {
    if (!edges || edges.length === 0) return null;
    
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(edges, 3));
    return geom;
  }, [edges]);

  if (!geometry || !visible) return null;

  const finalColor = highlighted ? '#00ff00' : color; // Green when highlighted
  const linewidth = highlighted ? 4 : 2;

  return (
    <lineSegments geometry={geometry} userData={{ edgeIndex }}>
      <lineBasicMaterial color={finalColor} linewidth={linewidth} />
    </lineSegments>
  );
}

const VertexMesh = ({ position, color = '#ff0000', vertexIndex, visible = true, highlighted = false }: { 
  position: [number, number, number]; 
  color?: string; 
  vertexIndex: number;
  visible?: boolean;
  highlighted?: boolean;
}) => {
  if (!visible) return null;

  const finalColor = highlighted ? '#ffff00' : color; // Yellow when highlighted
  const size = highlighted ? 0.08 : 0.05;

  return (
    <mesh position={position} userData={{ vertexIndex }}>
      <sphereGeometry args={[size * 0.5, 8, 6]} />
      <meshBasicMaterial color={finalColor} />
    </mesh>
  );
}

const GeometryScene = ({ geometryData, faceVisibility, faceColors, edgeVisibility, edgeColors, highlightedEdges, vertexVisibility, vertexColors, highlightedVertices }: { geometryData: GeometryData; faceVisibility: boolean[]; faceColors: string[]; edgeVisibility: boolean[]; edgeColors: string[]; highlightedEdges: boolean[]; vertexVisibility: boolean[]; vertexColors: string[]; highlightedVertices: boolean[]}) => {
  const [parsedGeometry, setParsedGeometry] = useState<ParsedGeometry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setError(null);
      const parsed = GeometryParser.parse(geometryData);
      setParsedGeometry(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown parsing error');
      const fallback = GeometryParser.parse({});
      setParsedGeometry(fallback);
    }
  }, [geometryData]);

  const getUniqueVertices = () => {
    if (!parsedGeometry) return [];
    
    const uniqueVertices = new Map<string, { position: [number, number, number]; index: number }>();
    let vertexIndex = 0;
    
    parsedGeometry.parts.forEach((part) => {
      part.meshes.forEach((mesh) => {
        for (let i = 0; i < mesh.vertices.length; i += 3) {
          const x = parseFloat(mesh.vertices[i].toFixed(3));
          const y = parseFloat(mesh.vertices[i + 1].toFixed(3));
          const z = parseFloat(mesh.vertices[i + 2].toFixed(3));
          const key = `${x},${y},${z}`;
          
          if (!uniqueVertices.has(key)) {
            uniqueVertices.set(key, { 
              position: [x, y, z], 
              index: vertexIndex++ 
            });
          }
        }
      });
    });
    
    return Array.from(uniqueVertices.values());
  };

  if (!parsedGeometry) {
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

  // Calculate global indices for rendering
  let globalFaceIndex = 0;
  let globalEdgeIndex = 0;
  const uniqueVertices = getUniqueVertices();

  return (
    <group>
      {/* Render all parts */}
      {parsedGeometry.parts.map((part, partIndex) => (
        <group key={`part-${partIndex}`} userData={{ partId: part.id, partName: part.name }}>
          {/* Render face meshes */}
          {part.meshes.map((mesh, meshIndex) => {
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
          
          {/* Render wireframe edges */}
          {part.edges.length > 0 && (
        [...Array(part.edges.length / 6)].map((_, edgeIdx) => {
          const startIndex = edgeIdx * 6;
          const edgeCoords = part.edges.slice(startIndex, startIndex + 6);

          const globalEdgeIdx = globalEdgeIndex + edgeIdx; // offset

          return (
            <WireframeMesh 
              key={`edge-${partIndex}-${edgeIdx}`}
              edges={edgeCoords}
              color={edgeColors[globalEdgeIdx] || part.wireframeColor}
              edgeIndex={globalEdgeIdx}
              visible={edgeVisibility[globalEdgeIdx] !== false}
              highlighted={highlightedEdges[globalEdgeIdx]}
            />
          );
        })
      )}
        </group>
      ))}
      
      {/* Render vertices */}
      {uniqueVertices.map((vertex, index) => (
        <VertexMesh
          key={`vertex-${index}`}
          position={vertex.position}
          color={vertexColors[index] || '#ff0000'}
          vertexIndex={index}
          visible={vertexVisibility[index] !== false}
          highlighted={highlightedVertices[index]}
        />
      ))}
      
      
      {/* Show error message if parsing failed */}
      {error && (
        <group position={[0, 2, 0]}>
          <mesh>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
        </group>
      )}
    </group>
  );
} 

const Experience = ({ 
  useOrtho, 
  cameraPosition, 
  isTransform, 
  isChangePivot, 
  setIsChangePivot, 
  geometryData, 
  faceVisibility, 
  faceColors,
  edgeVisibility,
  edgeColors,
  highlightedEdges,
  vertexVisibility,
  vertexColors,
  highlightedVertices
}: ExperienceProps) => {
    const orthoRef = useRef<THREE.OrthographicCamera>(null)
    const perspectiveRef = useRef<THREE.PerspectiveCamera>(null)
    const meshRef = useRef<THREE.Mesh>(null)

    // Keyboard controls 
    const frontShortcutKey = useKeyboardControls((state) => state[controls.FRONT])
    const backShortcutKey = useKeyboardControls((state) => state[controls.BACK])
    const leftShortcutKey = useKeyboardControls((state) => state[controls.LEFT])
    const rightShortcutKey = useKeyboardControls((state) => state[controls.RIGHT])
    const topShortcutKey = useKeyboardControls((state) => state[controls.TOP])
    const bottomShortcutKey = useKeyboardControls((state) => state[controls.BOTTOM])
    const orthoShortcutKey = useKeyboardControls((state) => state[controls.ORTHO])
    const transformShortcutKey = useKeyboardControls((state) => state[controls.TRANSFORM])

    // Handle keyboard shortcuts
    useEffect(() => {
        if (frontShortcutKey) {
            setCameraPosition([0, 0, 5])
            setUseOrtho(false)
        } else if (backShortcutKey) {
            setCameraPosition([0, 0, -5])
            setUseOrtho(false)
        } else if (leftShortcutKey) {
            setCameraPosition([-5, 0, 0])
            setUseOrtho(false)
        } else if (rightShortcutKey) {
            setCameraPosition([5, 0, 0])
            setUseOrtho(false)
        } else if (topShortcutKey) {
            setCameraPosition([0, 5, 0])
            setUseOrtho(false)
        } else if (bottomShortcutKey) {
            setCameraPosition([0, -5, 0])
            setUseOrtho(false)
        } else if (orthoShortcutKey) {
            setCameraPosition([3, 3, 3])
            setUseOrtho((prev) => !prev)
        }

        if (transformShortcutKey) {
            setIsTransform((prev) => !prev)
        }
    }, [
        frontShortcutKey,
        backShortcutKey,
        leftShortcutKey,
        rightShortcutKey,
        topShortcutKey,
        bottomShortcutKey,
        orthoShortcutKey,
        transformShortcutKey,
        setCameraPosition,
        setUseOrtho,
        setIsTransform
    ])

    useEffect(() => {
        if (useOrtho) {
          orthoRef.current?.lookAt(0, 0, 0)
        } else {
          perspectiveRef.current?.lookAt(0, 0, 0)
        }
    }, [useOrtho, cameraPosition])

    useEffect(() => {
      if (!geometryData) return;

      // Find active camera
      const camera = useOrtho ? orthoRef.current : perspectiveRef.current;
      if (!camera || !meshRef.current) return;

      // Compute bounding box
      const box = new THREE.Box3().setFromObject(meshRef.current);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      // Update camera position
      const maxDim = Math.max(size.x, size.y, size.z);
      const fitDistance = maxDim * (useOrtho ? 1.5 : 2);

      if (useOrtho) {
        camera.zoom = 100 / maxDim;
        camera.updateProjectionMatrix();
      } else {
        const direction = new THREE.Vector3(0, 0, 1);
        camera.position.copy(center.clone().add(direction.multiplyScalar(fitDistance)));
      }

      camera.lookAt(center);

      
    }, [geometryData, useOrtho]);

    const [isSelected, setIsSelected] = useState<boolean>(false)
    const [pivotDataPreviousIndex, setPivotDataPreviousIndex] = useState<number>(0)
    const [pivotDataIndex, setPivotDataIndex] = useState<number>(0)

    const raycaster = useMemo(() => new THREE.Raycaster(), [])
    const mouse = useMemo(() => new THREE.Vector2(), [])

    useEffect(() => {
        const handleClick = () => {
            if (isChangePivot) {
                setIsChangePivot(false);
                setPivotDataPreviousIndex(pivotDataIndex);
            }
        };
    
        const handleKeyDown = (event: KeyboardEvent) => {
            if (isChangePivot && event.code === 'Escape') {
                setIsChangePivot(false);
                setPivotDataIndex(pivotDataPreviousIndex);
            }
        };
    
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("click", handleClick);
    
        return () => {
            window.removeEventListener("click", handleClick);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isChangePivot, pivotDataIndex, pivotDataPreviousIndex]);    

    const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
        if (!meshRef.current || !isChangePivot) return

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

        raycaster.setFromCamera(mouse, event.camera)
        const intersects = raycaster.intersectObject(meshRef.current)

        if (intersects.length > 0) {
            const hitPoint = intersects[0].point

            // Find the nearest pivot anchor
            let minDist = Infinity
            let closestIndex = 0

            pivotData.forEach((pivot, index) => {
                if (pivot.name === 'center') return 

                const worldPos = new THREE.Vector3(...pivot.position)
                // Apply box world transform to pivot position
                worldPos.applyMatrix4(meshRef.current!.matrixWorld)

                const dist = pivot.name === "corner"
                    ? hitPoint.distanceTo(worldPos)
                    : pivot.name === "edge" ? hitPoint.distanceTo(worldPos) + 0.25
                    : hitPoint.distanceTo(worldPos) + 0.5

                if (dist < minDist) {
                    minDist = dist
                    closestIndex = index
                }
            })

            setPivotDataIndex(closestIndex)
        }
    }

    return (
        <>
            {useOrtho ? (
                <OrthographicCamera ref={orthoRef} makeDefault position={cameraPosition} zoom={100} near={0.1} far={1000} />
            ) : (
                <PerspectiveCamera ref={perspectiveRef} makeDefault position={cameraPosition} fov={50} near={0.1} far={1000} />
            )}

            <OrbitControls ref={orbitControlsRef} enableDamping={false} minDistance={1} maxDistance={10} makeDefault />

            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            
            {showGrid && <Grid infiniteGrid />}

            <PivotControls
              anchor={pivotData[pivotDataIndex].position}
              rotation={pivotData[pivotDataIndex].rotation}
              depthTest={false}
              disableAxes={!isTransform}
              disableSliders={!isTransform}
              disableRotations={!isTransform}
              disableScaling
              scale={0.5}>
              <group   ref={meshRef}
              onPointerMove={handlePointerMove}
              onClick={() => setIsSelected(true)}>
                  {geometryData && Object.keys(geometryData).length > 0 ? (
                      <GeometryScene 
                          geometryData={geometryData} 
                          faceVisibility={faceVisibility} 
                          faceColors={faceColors}
                          edgeVisibility={edgeVisibility}
                          edgeColors={edgeColors}
                          highlightedEdges={highlightedEdges}
                          vertexVisibility={vertexVisibility}
                          vertexColors={vertexColors}
                          highlightedVertices={highlightedVertices}
                      />
                  ) : (
                      <mesh
                          ref={meshRef}
                          onPointerMove={handlePointerMove}
                          onClick={() => setIsSelected(true)}
                      >
                          <boxGeometry args={[1, 1, 1]} />
                          <meshStandardMaterial color={isSelected ? "#34cdff" : "orange"} />
                          <Edges linewidth={4} color="white" visible={isSelected} />
                      </mesh>
                  )}
              </group>
          </PivotControls>


            <OrbitControls  enableDamping={false} minDistance={1} maxDistance={100} makeDefault />
            <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                <GizmoViewport />   
            </GizmoHelper>
        </>
    )
}

export default Experience