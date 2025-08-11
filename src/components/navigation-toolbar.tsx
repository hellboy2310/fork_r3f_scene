'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import { useKeyboardControls } from '@react-three/drei'
import { useTheme } from 'next-themes'
import controls from '@/constants/controls'
import { CollapsiblePanel } from './collapsible-panel'

interface ControlsInterfaceProps {
  setCameraPosition: (pos: [number, number, number]) => void
  setUseOrtho: React.Dispatch<React.SetStateAction<boolean>>
  isTransform: boolean
  isChangePivot: boolean
  setIsTransform: React.Dispatch<React.SetStateAction<boolean>>
  setIsChangePivot: React.Dispatch<React.SetStateAction<boolean>>
}

type ButtonAction = 
  | { type: 'position', position: [number, number, number] }
  | { type: 'fit' }
  | { type: 'reset' }
  | { type: 'toggle', feature: string }

const getViewButtons = (theme: string = 'dark'):  Array<{ id: string, icon: string, action: ButtonAction, tooltip: string }> => [
  { id: 'orthographic', icon: `/icons/${theme}/iso.svg`, action: { type: 'position', position: [3, 3, 3] }, tooltip: 'Orthographic View' },
  { id: 'front', icon: `/icons/${theme}/front.svg`, action: { type: 'position', position: [0, 0, 5] }, tooltip: 'Front View' },
  { id: 'rear', icon: `/icons/${theme}/rear.svg`, action: { type: 'position', position: [0, 0, -5] }, tooltip: 'Rear View' },
  { id: 'left', icon: `/icons/${theme}/left.svg`, action: { type: 'position', position: [-5, 0, 0] }, tooltip: 'Left View' },
  { id: 'right', icon: `/icons/${theme}/right.svg`, action: { type: 'position', position: [5, 0, 0] }, tooltip: 'Right View' },
  { id: 'top', icon: `/icons/${theme}/top.svg`, action: { type: 'position', position: [0, 5, 0] }, tooltip: 'Top View' },
  { id: 'bottom', icon: `/icons/${theme}/bottom.svg`, action: { type: 'position', position: [0, -5, 0] }, tooltip: 'Bottom View' },
  { id: 'fit', icon: `/icons/${theme}/resize.svg`, action: { type: 'fit' }, tooltip: 'Fit to Screen' },
  { id: 'transparent', icon: `/icons/${theme}/transparent.svg`, action: { type: 'toggle', feature: 'transparent' }, tooltip: 'Toggle Transparency' },
  { id: 'wireframe', icon: `/icons/${theme}/black_edges.svg`, action: { type: 'toggle', feature: 'wireframe' }, tooltip: 'Toggle Wireframe' },
  { id: 'grid', icon: `/icons/${theme}/grid.svg`, action: { type: 'toggle', feature: 'grid' }, tooltip: 'Toggle Grid' },
  { id: 'axes', icon: `/icons/${theme}/axes.svg`, action: { type: 'toggle', feature: 'axes' }, tooltip: 'Toggle Axes' },
  { id: 'axes0', icon: `/icons/${theme}/axes0.svg`, action: { type: 'toggle', feature: 'axes0' }, tooltip: 'Toggle Origin Axes' },
]

export const NavigationToolbar: React.FC<ControlsInterfaceProps> = ({ 
  setCameraPosition, 
  setUseOrtho, 
  isTransform, 
  isChangePivot, 
  setIsTransform, 
  setIsChangePivot 
}) => {
  const { theme } = useTheme()
  const viewButtons = getViewButtons(theme || 'dark')

  const handleAction = (action: ButtonAction) => {
    switch (action.type) {
      case 'position':
        setCameraPosition(action.position)
        break
      case 'reset':
        setCameraPosition([3, 3, 3])
        break
      case 'toggle':
        if (action.feature === 'perspective') {
          setUseOrtho((prev) => !prev)
        } else if (action.feature === 'axes') {
          setIsTransform((prev) => !prev)
        } else if (action.feature === 'axes0') {
          setIsChangePivot((prev) => !prev)
        }
        break
    }
    return
  }


  // Keyboard controls 
  const frontShortcutKey = useKeyboardControls((state) => state[controls.FRONT])
  const backShortcutKey = useKeyboardControls((state) => state[controls.BACK])
  const leftShortcutKey = useKeyboardControls((state) => state[controls.LEFT])
  const rightShortcutKey = useKeyboardControls((state) => state[controls.RIGHT])
  const topShortcutKey = useKeyboardControls((state) => state[controls.TOP])
  const bottomShortcutKey = useKeyboardControls((state) => state[controls.BOTTOM])
  const orthoShortcutKey = useKeyboardControls((state) => state[controls.ORTHO])
  const transformShortcutKey = useKeyboardControls((state) => state[controls.TRANSFORM])

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

  return (
    <CollapsiblePanel
      defaultPosition={{
        x: -16, // 16px from right edge (matching control panel margin)
        y: 60
      }}
      expandedSize={{ width: 66, height: 'auto' }}
      headerLayout="reversed"
      expansionDirection="left"
      collapsedIcon={<Menu className="h-5 w-5" />}
    >
      <div className="flex flex-col space-y-1 items-center justify-center p-1">
        {/* Navigation Buttons in 2-column grid */}
        <div className="grid grid-cols-2 gap-1">
          {viewButtons.map((button) => (
            <button
              key={button.id}
              className="w-7 h-7 p-0 hover:bg-accent rounded-lg flex items-center justify-center transition-colors"
              onClick={() => handleAction(button.action)}
              title={button.tooltip}
            >
              <Image
                src={button.icon}
                alt={button.id}
                width={22}
                height={22}
              />
            </button>
          ))}
        </div>
      </div>
    </CollapsiblePanel>
  )
}