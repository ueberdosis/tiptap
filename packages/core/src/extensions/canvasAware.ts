/**
 * Canvas Aware Extension
 *
 * Core extension that enables canvas-aware features in the editor.
 * This extension sets up event listeners and utilities for canvas integration.
 */

import { Extension } from '../Extension.js'
import type { CanvasContext, CanvasMode } from '../types/canvas.js'

export interface CanvasAwareOptions {
  /**
   * Whether to automatically disable the editor when canvas is in pan/select mode
   * @default true
   */
  autoDisableOnCanvasMode: boolean

  /**
   * Whether to handle viewport visibility changes
   * @default false
   */
  handleVisibility: boolean

  /**
   * Callback when editor becomes visible in viewport
   */
  onVisible?: () => void

  /**
   * Callback when editor becomes hidden from viewport
   */
  onHidden?: () => void

  /**
   * Callback when canvas zoom changes
   */
  onZoomChange?: (zoom: number, previousZoom: number) => void

  /**
   * Callback when viewport changes
   */
  onViewportChange?: (viewport: any) => void

  /**
   * Callback when canvas mode changes
   */
  onModeChange?: (mode: string, previousMode: string) => void
}

/**
 * Canvas Aware Extension
 *
 * Enables canvas-aware features and provides event handling for canvas interactions.
 *
 * @example
 * new Editor({
 *   extensions: [
 *     CanvasAware.configure({
 *       autoDisableOnCanvasMode: true,
 *       handleVisibility: true,
 *       onZoomChange: (zoom) => console.log('Zoom changed to', zoom),
 *     })
 *   ]
 * })
 */
export const CanvasAware = Extension.create<CanvasAwareOptions>({
  name: 'canvasAware',

  addOptions() {
    return {
      autoDisableOnCanvasMode: true,
      handleVisibility: false,
      onVisible: undefined,
      onHidden: undefined,
      onZoomChange: undefined,
      onViewportChange: undefined,
      onModeChange: undefined,
    }
  },

  onCreate() {
    // Set up canvas event listeners
    this.editor.on('canvasZoom', ({ zoom, previousZoom }) => {
      if (this.options.onZoomChange) {
        this.options.onZoomChange(zoom, previousZoom)
      }
    })

    this.editor.on('canvasViewportChange', ({ viewport }) => {
      if (this.options.onViewportChange) {
        this.options.onViewportChange(viewport)
      }
    })

    this.editor.on('canvasModeChange', ({ mode, previousMode }) => {
      if (this.options.onModeChange) {
        this.options.onModeChange(mode, previousMode)
      }

      // Auto-disable editor when in pan/select mode
      if (this.options.autoDisableOnCanvasMode) {
        const shouldDisable = mode === 'pan' || mode === 'select'
        this.editor.setEditable(!shouldDisable)
      }
    })

    this.editor.on('canvasVisibilityChange', ({ isVisible }) => {
      if (this.options.handleVisibility) {
        if (isVisible && this.options.onVisible) {
          this.options.onVisible()
        } else if (!isVisible && this.options.onHidden) {
          this.options.onHidden()
        }
      }
    })
  },
})

/**
 * Helper function to create a canvas context for an editor
 */
export function createCanvasContext(options: {
  nodeId: string
  nodePosition: { x: number; y: number }
  nodeSize: { width: number; height: number }
  viewport: {
    offset: { x: number; y: number }
    size: { width: number; height: number }
    zoom: number
  }
  mode?: CanvasMode
  editorElement?: HTMLElement | null
}): CanvasContext {
  const { nodeId, nodePosition, nodeSize, viewport, mode = 'edit' as CanvasMode, editorElement } = options

  // Import the transform helper
  const { createCoordinateTransform } = require('../helpers/canvasTransform.js')

  return {
    viewport,
    node: {
      id: nodeId,
      position: nodePosition,
      size: nodeSize,
    },
    mode,
    transform: createCoordinateTransform(viewport, nodePosition, editorElement),
    isVisible: true,
    updateViewport: newViewport => {
      Object.assign(viewport, newViewport)
    },
    updateNode: newNode => {
      if (newNode.position) {Object.assign(nodePosition, newNode.position)}
      if (newNode.size) {Object.assign(nodeSize, newNode.size)}
    },
    updateMode: _newMode => {
      // This would be updated by the parent canvas
    },
  }
}
