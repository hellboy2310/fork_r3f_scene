'use client'

import { useState, useEffect, useCallback, ReactNode } from 'react'
import { Rnd } from 'react-rnd'
import { Menu, X } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

export interface CollapsiblePanelProps {
  // Content
  children: ReactNode
  title?: string
  
  // Positioning
  defaultPosition: { x: number; y: number }
  collapsedSize?: { width: number; height: number }
  expandedSize: { width: number | 'auto'; height: number | 'auto' }
  
  // Behavior
  autoCollapseOnMobile?: boolean
  enableResize?: boolean
  bounds?: string
  headerLayout?: 'default' | 'reversed'
  expansionDirection?: 'right' | 'left'
  
  // Styling
  className?: string
  collapsedIcon?: ReactNode
  
  // Events
  onExpand?: () => void
  onCollapse?: () => void
  onDragStop?: (e: any, data: { x: number; y: number }) => void
}

// Helper function to calculate safe position
const calculateSafePosition = (
  windowWidth: number, 
  panelWidth: number, 
  preferredX: number,
  minMargin: number = 16
) => {
  // Handle negative X values as right-edge offsets
  if (preferredX < 0) {
    // Negative X means "distance from right edge"
    // e.g., -16 means "16px from right edge"
    const rightEdgePosition = windowWidth + preferredX - panelWidth
    return Math.max(rightEdgePosition, minMargin)
  }
  
  // Positive X values work as before (left-edge positioning)
  const maxX = Math.max(windowWidth - panelWidth - minMargin, minMargin)
  return Math.min(preferredX, maxX)
}

// Debounce function for resize events
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function CollapsiblePanel({
  children,
  title,
  defaultPosition,
  collapsedSize = { width: 40, height: 40 },
  expandedSize,
  autoCollapseOnMobile = true,
  enableResize = false,
  bounds = "parent",
  headerLayout = 'default',
  expansionDirection = 'right',
  className = "",
  collapsedIcon,
  onExpand,
  onCollapse,
  onDragStop: externalOnDragStop
}: CollapsiblePanelProps) {
  const isMobile = useIsMobile()
  const [isExpanded, setIsExpanded] = useState(true)
  
  // Calculate effective panel width for initial positioning
  // Use collapsed width if panel will auto-collapse on mobile
  const effectiveWidth = (autoCollapseOnMobile && isMobile) 
    ? collapsedSize.width 
    : (typeof expandedSize.width === 'number' ? expandedSize.width : 66)
  
  // Dynamic position state for responsive positioning
  const [position, setPosition] = useState(() => ({
    x: typeof window !== 'undefined' ? 
        calculateSafePosition(
          window.innerWidth, 
          effectiveWidth,
          defaultPosition.x
        ) : Math.abs(defaultPosition.x), // Use absolute value for SSR fallback
    y: defaultPosition.y
  }))

  // Update expanded state based on mobile/desktop
  useEffect(() => {
    if (autoCollapseOnMobile) {
      setIsExpanded(!isMobile)
    }
  }, [isMobile, autoCollapseOnMobile])

  // Handle window resize for responsive positioning
  useEffect(() => {
    const handleResize = debounce(() => {
      // Use same effective width logic as initial positioning
      const panelWidth = (autoCollapseOnMobile && isMobile) 
        ? collapsedSize.width 
        : (typeof expandedSize.width === 'number' ? expandedSize.width : 66)
      setPosition(prev => ({
        ...prev,
        x: calculateSafePosition(window.innerWidth, panelWidth, defaultPosition.x)
      }))
    }, 100)

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [defaultPosition.x, expandedSize.width, autoCollapseOnMobile, isMobile, collapsedSize.width])

  // Handle drag end to update position state
  const handleDragStop = useCallback((e: any, data: { x: number; y: number }) => {
    setPosition({ x: data.x, y: data.y })
    externalOnDragStop?.(e, data)
  }, [externalOnDragStop])

  // Handle expand/collapse
  const handleExpand = useCallback(() => {
    // For left expansion, adjust position so panel appears left of collapsed button
    if (expansionDirection === 'left') {
      const panelWidth = typeof expandedSize.width === 'number' ? expandedSize.width : 66
      setPosition(prev => ({
        ...prev,
        x: prev.x - panelWidth + collapsedSize.width
      }))
    }
    setIsExpanded(true)
    onExpand?.()
  }, [onExpand, expansionDirection, expandedSize.width, collapsedSize.width])

  const handleCollapse = useCallback(() => {
    // For left expansion, adjust position back to collapsed button location
    if (expansionDirection === 'left') {
      const panelWidth = typeof expandedSize.width === 'number' ? expandedSize.width : 66
      setPosition(prev => ({
        ...prev,
        x: prev.x + panelWidth - collapsedSize.width
      }))
    }
    setIsExpanded(false)
    onCollapse?.()
  }, [onCollapse, expansionDirection, expandedSize.width, collapsedSize.width])

  if (!isExpanded) {
    return (
      <Rnd
        position={{ x: position.x, y: position.y }}
        size={collapsedSize}
        enableResizing={false}
        bounds={bounds}
        disableDragging={isMobile}
        dragHandleClassName="drag-handle"
        onDragStop={handleDragStop}
        style={{ zIndex: 100 }}
      >
        <button
          onClick={handleExpand}
          className="w-full h-full rounded-full shadow-lg text-primary hover:bg-primary hover:text-primary-foreground drag-handle cursor-move border border-border flex items-center justify-center transition-colors"
        >
          {collapsedIcon || <Menu className="h-5 w-5" />}
        </button>
      </Rnd>
    )
  }

  return (
    <Rnd
      position={position}
      size={expandedSize}
      enableResizing={enableResize ? {
        top: false,
        right: true,
        bottom: true,
        left: false,
        topRight: false,
        bottomRight: true,
        bottomLeft: false,
        topLeft: false,
      } : false}
      resizeHandleStyles={{
        right: { width: '8px', right: '-4px' },
        bottom: { height: '8px', bottom: '-4px' },
        bottomRight: { width: '12px', height: '12px', right: '-6px', bottom: '-6px' }
      }}
      maxWidth={typeof window !== 'undefined' ? window.innerWidth / 2 : undefined}
      maxHeight={typeof window !== 'undefined' ? window.innerHeight - 100 : undefined}
      bounds={bounds}
      disableDragging={isMobile && !isExpanded}
      dragHandleClassName="drag-handle"
      onDragStop={handleDragStop}
      style={{ zIndex: 100 }}
    >
      <div className={`w-full h-full shadow-lg border border-border/50 rounded-lg bg-card ${className}`}>
        {/* Header row with drag handle and close button */}
        <div className="w-full h-8 flex items-center justify-between rounded-t-lg bg-muted/30 hover:bg-muted/50 transition-colors border-b border-border/30 px-2">
          {headerLayout === 'reversed' ? (
            <>
              {/* Close button first (left side) */}
              <button
                onClick={handleCollapse}
                className="h-6 w-6 hover:bg-accent rounded transition-colors flex items-center justify-center flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
              
              {/* Drag handle second (right side) */}
              <div className="drag-handle cursor-move flex items-center space-x-0.5 flex-1 justify-end">
                <div className="w-1 h-1 rounded-full bg-muted-foreground/40"></div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/40"></div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/40"></div>
              </div>
            </>
          ) : (
            <>
              {/* Drag handle first (left side) */}
              <div className="drag-handle cursor-move flex items-center space-x-0.5 flex-1">
                <div className="w-1 h-1 rounded-full bg-muted-foreground/40"></div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/40"></div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/40"></div>
              </div>
              
              {/* Close button second (right side) */}
              <button
                onClick={handleCollapse}
                className="h-6 w-6 hover:bg-accent rounded transition-colors flex items-center justify-center flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Title (optional) */}
        {title && (
          <div className="px-4 pt-2 pb-1">
            <h3 className="text-sm font-medium">{title}</h3>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </Rnd>
  )
}