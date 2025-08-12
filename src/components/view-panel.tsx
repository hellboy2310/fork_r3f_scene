'use client'

import { useState, useEffect } from 'react'
import { Rnd } from 'react-rnd'
import { useTheme } from 'next-themes'
import { useCanvas } from '@/contexts/CanvasContext'

import { PanelLeftClose,
         Menu,
         Grip } from 'lucide-react'

type ButtonAction = 
  | { type: 'position', position: [number, number, number] }
  | { type: 'fit' }
  | { type: 'reset' }
  | { type: 'toggle', feature: string }


interface ViewPanelProps {
  x?: number
  y?: number
  width?: number
  height?: number
}

export function ViewPanel({
  x,
  y = 60,
  width = 80,
  height = 300
}: ViewPanelProps) {
  const { 
    setCameraPosition,
    setUseOrtho,
    setIsTransform,
    setIsChangePivot,
    setShowGrid,
    setShowWireframe,
    fitToScreen
  } = useCanvas()
  
  const [isVisible, setIsVisible] = useState(true)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  const { theme } = useTheme()

  const dynamicX = x ?? (windowWidth - width - 16)

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleAction = (action: ButtonAction) => {
    switch (action.type) {
      case 'position':
        setCameraPosition(action.position)
        break
      case 'reset':
        setCameraPosition([3, 3, 3])
        break
      case 'fit':
        // Fit camera to scene bounds
        if (fitToScreen) {
          fitToScreen()
        }
        break
      case 'toggle':
        if (action.feature === 'perspective') {
          setUseOrtho((prev) => !prev)
        } else if (action.feature === 'axes') {
          setIsTransform((prev) => !prev)
        } else if (action.feature === 'axes0') {
          setIsChangePivot((prev) => !prev)
        } else if (action.feature === 'grid') {
          setShowGrid((prev) => !prev)
        } else if (action.feature === 'wireframe') {
          setShowWireframe((prev) => !prev)
        }
        break
    }
    return
  }

  const viewItems: Array<{ id: string, icon: string, action: ButtonAction, tooltip: string }> = [
    { id: 'orthographic', icon: `/icons/${theme}/iso.svg`, action: { type: 'position', position: [3, 3, 3] }, tooltip: 'Orthographic View' },
    { id: 'fit', icon: `/icons/${theme}/resize.svg`, action: { type: 'fit' }, tooltip: 'Fit to Screen' },
    { id: 'front', icon: `/icons/${theme}/front.svg`, action: { type: 'position', position: [0, 0, 5] }, tooltip: 'Front View' },
    { id: 'rear', icon: `/icons/${theme}/rear.svg`, action: { type: 'position', position: [0, 0, -5] }, tooltip: 'Rear View' },
    { id: 'left', icon: `/icons/${theme}/left.svg`, action: { type: 'position', position: [-5, 0, 0] }, tooltip: 'Left View' },
    { id: 'right', icon: `/icons/${theme}/right.svg`, action: { type: 'position', position: [5, 0, 0] }, tooltip: 'Right View' },
    { id: 'top', icon: `/icons/${theme}/top.svg`, action: { type: 'position', position: [0, 5, 0] }, tooltip: 'Top View' },
    { id: 'bottom', icon: `/icons/${theme}/bottom.svg`, action: { type: 'position', position: [0, -5, 0] }, tooltip: 'Bottom View' },
    { id: 'transparent', icon: `/icons/${theme}/transparent.svg`, action: { type: 'toggle', feature: 'transparent' }, tooltip: 'Toggle Transparency' },
    { id: 'wireframe', icon: `/icons/${theme}/black_edges.svg`, action: { type: 'toggle', feature: 'wireframe' }, tooltip: 'Toggle Wireframe' },
    { id: 'grid', icon: `/icons/${theme}/grid.svg`, action: { type: 'toggle', feature: 'grid' }, tooltip: 'Toggle Grid' },
    { id: 'axes', icon: `/icons/${theme}/axes.svg`, action: { type: 'toggle', feature: 'axes' }, tooltip: 'Toggle Axes' },
    { id: 'axes0', icon: `/icons/${theme}/axes0.svg`, action: { type: 'toggle', feature: 'axes0' }, tooltip: 'Toggle Origin Axes' },
  ]

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed top-16 right-4 p-2 bg-card border rounded-lg shadow-lg hover:bg-muted transition-colors z-50"
      >
        <Menu className="h-4 w-4 text-muted-foreground" />
      </button>
    )
  }
  return (
    <Rnd
      default={{ x: dynamicX, y, width, height }}
      enableResizing={{
        bottomLeft: true
      }}
      dragHandleClassName="drag-handle"
      style={{ zIndex: 100 }}
    >
      <div className="h-full w-full bg-card border rounded-lg shadow-lg">
        <div className="h-8 bg-muted rounded-t-lg border-b flex items-center">
          <button 
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-muted rounded transition-colors"
          >
            <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="drag-handle cursor-move px-1 py-1 hover:bg-muted rounded transition-colors flex items-center justify-center">
            <Grip className="h-4 w-4 text-muted-foreground hover:text-muted-foreground" />
          </div>
        </div>
        <div className="p-1 h-[calc(100%-2rem)] overflow-auto grid gap-1" style={{ gridTemplateColumns: 'repeat(2, minmax(32px, 1fr))' }}>
          {viewItems.map((item) => (
            <button
              key={item.id}
              className="w-7 h-7 p-0 hover:bg-accent rounded-lg flex items-center justify-center transition-colors"
              onClick={() => handleAction(item.action)}
              title={item.tooltip}
            >
              <img src={item.icon} alt={item.tooltip} className="w-[22px] h-[22px]" />
            </button>
          ))}
        </div>
      </div>
    </Rnd>
  )
}