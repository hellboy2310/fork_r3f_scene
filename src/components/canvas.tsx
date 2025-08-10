'use client'

import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { NavigationToolbar } from './navigation-toolbar'
import { useEffect, useMemo, useState } from 'react'
import controls from '@/constants/controls'

import Experience from './Experience'
import { ControlPanel } from './control-panel'
import { otherbox, sampleBox } from '@/constants/constants'
import { GeometryParser } from '@/utils/geometry-parser'
import { GeometryData } from '@/types/geometry'

export function SimpleCanvas(): JSX.Element {
  const [useOrtho, setUseOrtho] = useState<boolean>(false)
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([3, 3, 3])
  const [isTransform, setIsTransform] = useState<boolean>(false)
  const [isChangePivot, setIsChangePivot] = useState<boolean>(false)
  const [selectedBox, setSelectedBox] = useState<string>('');
  const [faceVisibility, setFaceVisibility] = useState<boolean[]>([]);
  const [faceColors, setFaceColors] = useState<string[]>([]);




  // Keyboard controls for shortcut key
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
  selectedBox === 'box2' ? otherbox :
  undefined

  
  useEffect(() => {
    if (!geometryData) {
      setFaceVisibility([]);
      setFaceColors([]);
      return;
    }

    try {
      const parsed = GeometryParser.parse(geometryData);
      const faceCount = parsed.stats.totalFaces;

      setFaceVisibility(new Array(faceCount).fill(true));
      const defaultColor = parsed.parts.length && parsed.parts[0].meshes.length
        ? parsed.parts[0].meshes[0].color
        : '#e8b024';
      setFaceColors(new Array(faceCount).fill(defaultColor));
    } catch {
      setFaceVisibility([]);
      setFaceColors([]);
    }
  }, [geometryData]);



  // Keyboard controls for pivot change
  return (
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
          </select>
        </div>
        <Canvas>
          <Experience useOrtho={useOrtho} cameraPosition={cameraPosition} isTransform={isTransform} isChangePivot={isChangePivot} setIsChangePivot={setIsChangePivot}  faceVisibility={faceVisibility} faceColors={faceColors} geometryData={geometryData} />
        </Canvas>
        <NavigationToolbar setCameraPosition={setCameraPosition} setUseOrtho={setUseOrtho} isTransform={isTransform} isChangePivot={isChangePivot} setIsTransform={setIsTransform} setIsChangePivot={setIsChangePivot}  />
        <ControlPanel  geometryData={geometryData} faceVisibility={faceVisibility} faceColors={faceColors} onFaceVisibilityChange={setFaceVisibility} onFaceColorsChange={setFaceColors}/>
      </div>
    </KeyboardControls>
  )
}
