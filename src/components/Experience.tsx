import { GeometryData } from '@/types/geometry'
import { GeometryParser, ParsedGeometry } from '@/utils/geometry-parser'
import { OrbitControls, GizmoHelper, GizmoViewport, OrthographicCamera, PerspectiveCamera, PivotControls, Edges } from '@react-three/drei'
import { ThreeEvent } from '@react-three/fiber'
import { useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

interface ExperienceProps {
    useOrtho: boolean
    cameraPosition: [number, number, number]
    isTransform: boolean
    isChangePivot: boolean
    setIsChangePivot: React.Dispatch<React.SetStateAction<boolean>>
    faceVisibility: boolean[]
    faceColors: string[]
    geometryData: GeometryData
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

const Experience = ({ useOrtho, cameraPosition, isTransform, isChangePivot, setIsChangePivot, geometryData, faceVisibility, faceColors }: ExperienceProps) => {
    const orthoRef = useRef<THREE.OrthographicCamera>(null)
    const perspectiveRef = useRef<THREE.PerspectiveCamera>(null)
    const controlsRef = useRef<any>(null);


    const meshRef = useRef<THREE.Mesh>(null)

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

    // Update OrbitControls target
    if (controlsRef.current) {
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }
  }, [geometryData, useOrtho]);


    const [isSelected, setIsSelected] = useState<boolean>(false)
    const [pivotDataPreviousIndex, setPivotDataPreviousIndex] = useState<number>(0)
    const [pivotDataIndex, setPivotDataIndex] = useState<number>(0)

    const raycaster = useMemo(() => new THREE.Raycaster(), [])
    const mouse = useMemo(() => new THREE.Vector2(), [])

    useEffect(() => {
        const handleWindowClick = (event: MouseEvent) => {
            if (!meshRef.current) return

            const canvas = document.querySelector('canvas')
            if (event.target !== canvas) return
      
            // Calculate mouse normalized coords for raycaster
            const mouseX = (event.clientX / window.innerWidth) * 2 - 1
            const mouseY = -(event.clientY / window.innerHeight) * 2 + 1
            const mouseVec = new THREE.Vector2(mouseX, mouseY)
        
            // Use the currently active camera (orthographic or perspective)
            const camera = useOrtho ? orthoRef.current : perspectiveRef.current
            if (!camera) return
        
            raycaster.setFromCamera(mouseVec, camera)
            const intersects = raycaster.intersectObject(meshRef.current)
        
            if (intersects.length === 0) {
                // Clicked outside mesh
                setIsSelected(false)
            }
        }
      
        window.addEventListener('click', handleWindowClick)
        return () => {
          window.removeEventListener('click', handleWindowClick)
        }
    }, [useOrtho, raycaster])

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

            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />

            <PivotControls
                anchor={pivotData[pivotDataIndex].position}
                rotation={pivotData[pivotDataIndex].rotation}
                depthTest={false}
                disableAxes={!isTransform}
                disableSliders={!isTransform}
                disableRotations={!isTransform}
                disableScaling
                scale={0.5}
            >
                {/* <mesh
                    ref={meshRef}
                    onPointerMove={handlePointerMove}
                    onClick={() => setIsSelected(true)}
                >
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color={isSelected ? "#34cdff" : "orange"} />
                    <Edges linewidth={4} color="white" visible={isSelected} />
                </mesh> */}
                    <group ref={meshRef}>
          <GeometryScene geometryData={geometryData} faceVisibility={faceVisibility} faceColors={faceColors} />
        </group>

            </PivotControls>

      <OrbitControls ref={controlsRef} enableDamping={false} minDistance={1} maxDistance={100} makeDefault />
            <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                <GizmoViewport />
            </GizmoHelper>
        </>
    )
}

export default Experience
