'use client'

import { GeometryData } from '@/types/geometry'
import React, { createContext, useContext, useState, ReactNode } from 'react'

interface CanvasState {
  useOrtho: boolean
  cameraPosition: [number, number, number]
  isTransform: boolean
  isChangePivot: boolean
  showGrid: boolean
  showWireframe: boolean
  fitToScreen: (() => void) | null
  
  // Added geometry & interaction states
  geometryData?: GeometryData
  faceVisibility: boolean[]
  faceColors: string[]
  edgeVisibility: boolean[]
  edgeColors: string[]
  highlightedEdges: boolean[]
  vertexVisibility: boolean[]
  vertexColors: string[]
  highlightedVertices: boolean[]
}

interface CanvasActions {
  setUseOrtho: React.Dispatch<React.SetStateAction<boolean>>
  setCameraPosition: React.Dispatch<React.SetStateAction<[number, number, number]>>
  setIsTransform: React.Dispatch<React.SetStateAction<boolean>>
  setIsChangePivot: React.Dispatch<React.SetStateAction<boolean>>
  setShowGrid: React.Dispatch<React.SetStateAction<boolean>>
  setShowWireframe: React.Dispatch<React.SetStateAction<boolean>>
  setFitToScreen: React.Dispatch<React.SetStateAction<(() => void) | null>>

  // Added setters for geometry & interaction
  setGeometryData: React.Dispatch<React.SetStateAction<GeometryData | undefined>>
  setFaceVisibility: React.Dispatch<React.SetStateAction<boolean[]>>
  setFaceColors: React.Dispatch<React.SetStateAction<string[]>>
  setEdgeVisibility: React.Dispatch<React.SetStateAction<boolean[]>>
  setEdgeColors: React.Dispatch<React.SetStateAction<string[]>>
  setHighlightedEdges: React.Dispatch<React.SetStateAction<boolean[]>>
  setVertexVisibility: React.Dispatch<React.SetStateAction<boolean[]>>
  setVertexColors: React.Dispatch<React.SetStateAction<string[]>>
  setHighlightedVertices: React.Dispatch<React.SetStateAction<boolean[]>>
}

type CanvasContextType = CanvasState & CanvasActions

const CanvasContext = createContext<CanvasContextType | undefined>(undefined)

export const useCanvas = () => {
  const context = useContext(CanvasContext)
  if (!context) throw new Error('useCanvas must be used within a CanvasProvider')
  return context
}

interface CanvasProviderProps {
  children: ReactNode
}

export const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
  const [useOrtho, setUseOrtho] = useState(false)
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([3, 3, 3])
  const [isTransform, setIsTransform] = useState(false)
  const [isChangePivot, setIsChangePivot] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [showWireframe, setShowWireframe] = useState(false)
  const [fitToScreen, setFitToScreen] = useState<(() => void) | null>(null)

  const [geometryData, setGeometryData] = useState<GeometryData | undefined>()
  const [faceVisibility, setFaceVisibility] = useState<boolean[]>([])
  const [faceColors, setFaceColors] = useState<string[]>([])
  const [edgeVisibility, setEdgeVisibility] = useState<boolean[]>([])
  const [edgeColors, setEdgeColors] = useState<string[]>([])
  const [highlightedEdges, setHighlightedEdges] = useState<boolean[]>([])
  const [vertexVisibility, setVertexVisibility] = useState<boolean[]>([])
  const [vertexColors, setVertexColors] = useState<string[]>([])
  const [highlightedVertices, setHighlightedVertices] = useState<boolean[]>([])

  const value: CanvasContextType = {
    // state
    useOrtho,
    cameraPosition,
    isTransform,
    isChangePivot,
    showGrid,
    showWireframe,
    fitToScreen,
    geometryData,
    faceVisibility,
    faceColors,
    edgeVisibility,
    edgeColors,
    highlightedEdges,
    vertexVisibility,
    vertexColors,
    highlightedVertices,

    // setters
    setUseOrtho,
    setCameraPosition,
    setIsTransform,
    setIsChangePivot,
    setShowGrid,
    setShowWireframe,
    setFitToScreen,
    setGeometryData,
    setFaceVisibility,
    setFaceColors,
    setEdgeVisibility,
    setEdgeColors,
    setHighlightedEdges,
    setVertexVisibility,
    setVertexColors,
    setHighlightedVertices,
  }

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  )
}
