"use client"

import { useState } from "react"
import { CornerDownLeft } from "lucide-react"
import {
  Box,
  Grid3X3,
  Play,
  BarChart3,
} from "lucide-react"
import Link from 'next/link'
import { CollapsiblePanel } from './collapsible-panel'

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
  project?: Project | null
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

export function ControlPanel({ project }: ControlPanelProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "Geometry": true, // Default open based on isActive
    "Mesh": false,
    "Simulation": false,
    "Analysis": false,
  })

  return (
    <CollapsiblePanel
      defaultPosition={{ x: 16, y: 16 }}
      expandedSize={{ width: 320, height: 600 }}
      enableResize={true}
    >
      {/* Header with back button */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        {project && (
          <Link href="/dashboard" className="p-1 hover:bg-accent rounded transition-colors">
            <CornerDownLeft className="h-4 w-4" />
          </Link>
        )}
      </div>
      {/* Content */}
      <div className="p-0 flex-1 overflow-hidden">
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
      </div>
    </CollapsiblePanel>
  )
}