import type { CanvasContext, CanvasMode, Point, Viewport } from '@dibdab/core'
import { useCallback, useEffect, useRef,useState } from 'react'

import { type UseEditorOptions,useEditor } from './useEditor.js'

export interface UseCanvasEditorOptions extends UseEditorOptions {
  /**
   * Initial canvas context
   */
  canvasContext?: CanvasContext

  /**
   * Canvas node ID
   */
  nodeId: string

  /**
   * Initial node position
   */
  nodePosition?: Point

  /**
   * Initial node size
   */
  nodeSize?: { width: number; height: number }

  /**
   * Initial canvas mode
   */
  initialMode?: CanvasMode

  /**
   * Callback when canvas viewport changes
   */
  onViewportChange?: (viewport: Viewport) => void

  /**
   * Callback when canvas zoom changes
   */
  onZoomChange?: (zoom: number, previousZoom: number) => void

  /**
   * Callback when canvas mode changes
   */
  onModeChange?: (mode: CanvasMode, previousMode: CanvasMode) => void

  /**
   * Callback when node position changes
   */
  onNodeMove?: (position: Point, previousPosition: Point) => void

  /**
   * Callback when visibility changes
   */
  onVisibilityChange?: (isVisible: boolean) => void
}

export function useCanvasEditor(options: UseCanvasEditorOptions) {
  const {
    canvasContext: initialCanvasContext,
    nodeId,
    nodePosition = { x: 0, y: 0 },
    nodeSize = { width: 400, height: 300 },
    onViewportChange,
    onZoomChange,
    onModeChange,
    onNodeMove,
    onVisibilityChange,
    ...editorOptions
  } = options

  const [canvasContext, setCanvasContext] = useState<CanvasContext | null>(initialCanvasContext || null)

  const editorRef = useRef<HTMLDivElement>(null)

  // Create the editor with canvas support
  const editor = useEditor({
    ...editorOptions,
    onCreate: ({ editor: editorInstance }) => {
      // Set up canvas context if not provided
      if (!initialCanvasContext && editorRef.current) {
        // @ts-ignore - createCanvasContext is available from CanvasAware extension
        const context = editorInstance.commands.createCanvasContext(nodeId, nodePosition, nodeSize, editorRef.current)
        editorInstance.setCanvasContext(context)
        setCanvasContext(context)
      } else if (initialCanvasContext) {
        editorInstance.setCanvasContext(initialCanvasContext)
      }

      // Call user's onCreate
      if (editorOptions.onCreate) {
        editorOptions.onCreate({ editor: editorInstance })
      }
    },
  })

  // Set up canvas event listeners
  useEffect(() => {
    if (!editor) {return}

    const handleViewportChange = ({ viewport }: { viewport: Viewport }) => {
      setCanvasContext(prev => (prev ? { ...prev, viewport } : null))
      if (onViewportChange) {
        onViewportChange(viewport)
      }
    }

    const handleZoomChange = ({ zoom, previousZoom }: { zoom: number; previousZoom: number }) => {
      if (onZoomChange) {
        onZoomChange(zoom, previousZoom)
      }
    }

    const handleModeChange = ({ mode, previousMode }: { mode: CanvasMode; previousMode: CanvasMode }) => {
      setCanvasContext(prev => (prev ? { ...prev, mode } : null))
      if (onModeChange) {
        onModeChange(mode, previousMode)
      }
    }

    const handleNodeMove = ({ position, previousPosition }: { position: Point; previousPosition: Point }) => {
      if (onNodeMove) {
        onNodeMove(position, previousPosition)
      }
    }

    const handleVisibilityChange = ({ isVisible }: { isVisible: boolean }) => {
      setCanvasContext(prev => (prev ? { ...prev, isVisible } : null))
      if (onVisibilityChange) {
        onVisibilityChange(isVisible)
      }
    }

    editor.on('canvasViewportChange', handleViewportChange)
    editor.on('canvasZoom', handleZoomChange)
    editor.on('canvasModeChange', handleModeChange)
    editor.on('canvasNodeMove', handleNodeMove)
    editor.on('canvasVisibilityChange', handleVisibilityChange)

    return () => {
      editor.off('canvasViewportChange', handleViewportChange)
      editor.off('canvasZoom', handleZoomChange)
      editor.off('canvasModeChange', handleModeChange)
      editor.off('canvasNodeMove', handleNodeMove)
      editor.off('canvasVisibilityChange', handleVisibilityChange)
    }
  }, [editor, onViewportChange, onZoomChange, onModeChange, onNodeMove, onVisibilityChange])

  // Canvas control methods
  const updateViewport = useCallback(
    (viewport: Partial<Viewport>) => {
      if (editor) {
        editor.updateCanvasViewport(viewport)
      }
    },
    [editor],
  )

  const updateZoom = useCallback(
    (zoom: number, anchor?: Point) => {
      if (editor) {
        editor.updateCanvasZoom(zoom, anchor)
      }
    },
    [editor],
  )

  const updateMode = useCallback(
    (mode: CanvasMode) => {
      if (editor) {
        editor.updateCanvasMode(mode)
      }
    },
    [editor],
  )

  const updateNodePosition = useCallback(
    (position: Point) => {
      if (editor) {
        editor.updateCanvasNodePosition(position)
      }
    },
    [editor],
  )

  const updateVisibility = useCallback(
    (isVisible: boolean) => {
      if (editor) {
        editor.updateCanvasVisibility(isVisible)
      }
    },
    [editor],
  )

  return {
    editor,
    editorRef,
    canvasContext,
    updateViewport,
    updateZoom,
    updateMode,
    updateNodePosition,
    updateVisibility,
  }
}
