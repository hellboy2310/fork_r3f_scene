'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface CanvasState {
  useOrtho: boolean
  cameraPosition: [number, number, number]
  isTransform: boolean
  isChangePivot: boolean
  showGrid: boolean
  showWireframe: boolean
  fitToScreen: (() => void) | null
}

interface CanvasActions {
  setUseOrtho: React.Dispatch<React.SetStateAction<boolean>>
  setCameraPosition: React.Dispatch<React.SetStateAction<[number, number, number]>>
  setIsTransform: React.Dispatch<React.SetStateAction<boolean>>
  setIsChangePivot: React.Dispatch<React.SetStateAction<boolean>>
  setShowGrid: React.Dispatch<React.SetStateAction<boolean>>
  setShowWireframe: React.Dispatch<React.SetStateAction<boolean>>
  setFitToScreen: React.Dispatch<React.SetStateAction<(() => void) | null>>
}

type CanvasContextType = CanvasState & CanvasActions

const CanvasContext = createContext<CanvasContextType | undefined>(undefined)

export const useCanvas = () => {
  const context = useContext(CanvasContext)
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider')
  }
  return context
}

interface CanvasProviderProps {
  children: ReactNode
}

export const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
  const [useOrtho, setUseOrtho] = useState<boolean>(false)
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([3, 3, 3])
  const [isTransform, setIsTransform] = useState<boolean>(false)
  const [isChangePivot, setIsChangePivot] = useState<boolean>(false)
  const [showGrid, setShowGrid] = useState<boolean>(false)
  const [showWireframe, setShowWireframe] = useState<boolean>(false)
  const [fitToScreen, setFitToScreen] = useState<(() => void) | null>(null)

  const value: CanvasContextType = {
    // State
    useOrtho,
    cameraPosition,
    isTransform,
    isChangePivot,
    showGrid,
    showWireframe,
    fitToScreen,
    
    // Actions
    setUseOrtho,
    setCameraPosition,
    setIsTransform,
    setIsChangePivot,
    setShowGrid,
    setShowWireframe,
    setFitToScreen,
  }

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  )
}
