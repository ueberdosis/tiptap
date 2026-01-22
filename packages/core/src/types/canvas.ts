/**
 * Canvas Context Types
 *
 * These types enable DibDab to be canvas-aware, understanding its position
 * and state within spatial computing interfaces like node-based canvases,
 * infinite whiteboards, and visual programming environments.
 */

/**
 * Represents a 2D point in canvas space
 */
export interface Point {
  x: number
  y: number
}

/**
 * Represents a 2D size
 */
export interface Size {
  width: number
  height: number
}

/**
 * Represents a rectangle in canvas space
 */
export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Represents the viewport of the canvas
 */
export interface Viewport {
  /**
   * Top-left corner of the visible viewport in canvas space
   */
  offset: Point

  /**
   * Size of the visible viewport
   */
  size: Size

  /**
   * Current zoom level (1.0 = 100%, 0.5 = 50%, 2.0 = 200%)
   */
  zoom: number
}

/**
 * Represents coordinate transformation functions
 */
export interface CoordinateTransform {
  /**
   * Transform screen coordinates to canvas coordinates
   */
  screenToCanvas: (screenPoint: Point) => Point

  /**
   * Transform canvas coordinates to screen coordinates
   */
  canvasToScreen: (canvasPoint: Point) => Point

  /**
   * Transform screen coordinates to editor-local coordinates
   */
  screenToEditor: (screenPoint: Point) => Point

  /**
   * Transform editor-local coordinates to screen coordinates
   */
  editorToScreen: (editorPoint: Point) => Point
}

/**
 * Information about the parent node/container that holds the editor
 */
export interface CanvasNode {
  /**
   * Unique identifier for the parent node
   */
  id: string

  /**
   * Position of the parent node in canvas space
   */
  position: Point

  /**
   * Size of the parent node
   */
  size: Size

  /**
   * Z-index or layer of the parent node
   */
  zIndex?: number

  /**
   * Whether the parent node is selected
   */
  selected?: boolean

  /**
   * Custom data associated with the parent node
   */
  data?: Record<string, any>
}

/**
 * Canvas interaction modes that affect editor behavior
 */
export enum CanvasMode {
  /**
   * Normal editing mode - editor is interactive
   */
  EDIT = 'edit',

  /**
   * Canvas panning mode - editor should be non-interactive
   */
  PAN = 'pan',

  /**
   * Canvas selection mode - editor should be non-interactive
   */
  SELECT = 'select',

  /**
   * Read-only mode - editor displays content but is not editable
   */
  READONLY = 'readonly',
}

/**
 * Canvas event data for zoom changes
 */
export interface CanvasZoomEvent {
  /**
   * Previous zoom level
   */
  previousZoom: number

  /**
   * New zoom level
   */
  zoom: number

  /**
   * Point that should remain fixed during zoom (e.g., mouse position)
   */
  anchor?: Point
}

/**
 * Canvas event data for viewport changes
 */
export interface CanvasViewportEvent {
  /**
   * Previous viewport state
   */
  previousViewport: Viewport

  /**
   * New viewport state
   */
  viewport: Viewport
}

/**
 * Canvas event data for node movement
 */
export interface CanvasNodeMoveEvent {
  /**
   * Previous position of the parent node
   */
  previousPosition: Point

  /**
   * New position of the parent node
   */
  position: Point

  /**
   * Updated node information
   */
  node: CanvasNode
}

/**
 * Canvas event data for mode changes
 */
export interface CanvasModeChangeEvent {
  /**
   * Previous canvas mode
   */
  previousMode: CanvasMode

  /**
   * New canvas mode
   */
  mode: CanvasMode
}

/**
 * Main canvas context interface
 *
 * Provides all canvas-related information and functionality to the editor
 */
export interface CanvasContext {
  /**
   * Current viewport state
   */
  viewport: Viewport

  /**
   * Information about the parent node containing this editor
   */
  node: CanvasNode

  /**
   * Current canvas interaction mode
   */
  mode: CanvasMode

  /**
   * Coordinate transformation utilities
   */
  transform: CoordinateTransform

  /**
   * Whether the editor is currently visible in the viewport
   */
  isVisible: boolean

  /**
   * Update the viewport
   */
  updateViewport: (viewport: Partial<Viewport>) => void

  /**
   * Update the parent node information
   */
  updateNode: (node: Partial<CanvasNode>) => void

  /**
   * Update the canvas mode
   */
  updateMode: (mode: CanvasMode) => void

  /**
   * Custom canvas-specific data
   */
  data?: Record<string, any>
}

/**
 * Options for creating a canvas-aware editor
 */
export interface CanvasEditorOptions {
  /**
   * Initial canvas context
   */
  canvasContext?: CanvasContext

  /**
   * Whether to automatically disable the editor when canvas is in pan/select mode
   */
  autoDisableOnCanvasMode?: boolean

  /**
   * Whether to handle viewport visibility changes
   */
  handleVisibility?: boolean

  /**
   * Callback when editor becomes visible in viewport
   */
  onVisible?: () => void

  /**
   * Callback when editor becomes hidden from viewport
   */
  onHidden?: () => void
}
