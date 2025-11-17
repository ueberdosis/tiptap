import type { Node as PMNode } from '@tiptap/pm/model'
import type { Decoration, DecorationSource, NodeView } from '@tiptap/pm/view'

const isTouchEvent = (e: MouseEvent | TouchEvent): e is TouchEvent => {
  return 'touches' in e
}

/**
 * Directions where resize handles can be placed
 *
 * @example
 * - `'top'` - Top edge handle
 * - `'bottom-right'` - Bottom-right corner handle
 */
export type ResizableNodeViewDirection =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'

/**
 * Dimensions for the resizable node in pixels
 */
export type ResizableNodeDimensions = {
  /** Width in pixels */
  width: number
  /** Height in pixels */
  height: number
}

/**
 * Configuration options for creating a ResizableNodeView
 *
 * @example
 * ```ts
 * new ResizableNodeView({
 *   element: imgElement,
 *   node,
 *   getPos,
 *   onResize: (width, height) => {
 *     imgElement.style.width = `${width}px`
 *     imgElement.style.height = `${height}px`
 *   },
 *   onCommit: (width, height) => {
 *     editor.commands.updateAttributes('image', { width, height })
 *   },
 *   onUpdate: (node) => true,
 *   options: {
 *     directions: ['bottom-right', 'bottom-left'],
 *     min: { width: 100, height: 100 },
 *     preserveAspectRatio: true
 *   }
 * })
 * ```
 */
export type ResizableNodeViewOptions = {
  /**
   * The DOM element to make resizable (e.g., an img, video, or iframe element)
   */
  element: HTMLElement

  /**
   * The DOM element that will hold the editable content element
   */
  contentElement?: HTMLElement

  /**
   * The ProseMirror node instance
   */
  node: PMNode

  /**
   * Function that returns the current position of the node in the document
   */
  getPos: () => number | undefined

  /**
   * Callback fired continuously during resize with current dimensions.
   * Use this to update the element's visual size in real-time.
   *
   * @param width - Current width in pixels
   * @param height - Current height in pixels
   *
   * @example
   * ```ts
   * onResize: (width, height) => {
   *   element.style.width = `${width}px`
   *   element.style.height = `${height}px`
   * }
   * ```
   */
  onResize?: (width: number, height: number) => void

  /**
   * Callback fired once when resize completes with final dimensions.
   * Use this to persist the new size to the node's attributes.
   *
   * @param width - Final width in pixels
   * @param height - Final height in pixels
   *
   * @example
   * ```ts
   * onCommit: (width, height) => {
   *   const pos = getPos()
   *   if (pos !== undefined) {
   *     editor.commands.updateAttributes('image', { width, height })
   *   }
   * }
   * ```
   */
  onCommit: (width: number, height: number) => void

  /**
   * Callback for handling node updates.
   * Return `true` to accept the update, `false` to reject it.
   *
   * @example
   * ```ts
   * onUpdate: (node, decorations, innerDecorations) => {
   *   if (node.type !== this.node.type) return false
   *   return true
   * }
   * ```
   */
  onUpdate: NodeView['update']

  /**
   * Optional configuration for resize behavior and styling
   */
  options?: {
    /**
     * Which resize handles to display.
     * @default ['bottom-left', 'bottom-right', 'top-left', 'top-right']
     *
     * @example
     * ```ts
     * // Only show corner handles
     * directions: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
     *
     * // Only show right edge handle
     * directions: ['right']
     * ```
     */
    directions?: ResizableNodeViewDirection[]

    /**
     * Minimum dimensions in pixels
     * @default { width: 8, height: 8 }
     *
     * @example
     * ```ts
     * min: { width: 100, height: 50 }
     * ```
     */
    min?: Partial<ResizableNodeDimensions>

    /**
     * Maximum dimensions in pixels
     * @default undefined (no maximum)
     *
     * @example
     * ```ts
     * max: { width: 1000, height: 800 }
     * ```
     */
    max?: Partial<ResizableNodeDimensions>

    /**
     * Always preserve aspect ratio when resizing.
     * When `false`, aspect ratio is preserved only when Shift key is pressed.
     * @default false
     *
     * @example
     * ```ts
     * preserveAspectRatio: true // Always lock aspect ratio
     * ```
     */
    preserveAspectRatio?: boolean

    /**
     * Custom CSS class names for styling
     *
     * @example
     * ```ts
     * className: {
     *   container: 'resize-container',
     *   wrapper: 'resize-wrapper',
     *   handle: 'resize-handle',
     *   resizing: 'is-resizing'
     * }
     * ```
     */
    className?: {
      /** Class for the outer container element */
      container?: string
      /** Class for the wrapper element that contains the resizable element */
      wrapper?: string
      /** Class applied to all resize handles */
      handle?: string
      /** Class added to container while actively resizing */
      resizing?: string
    }
  }
}

/**
 * A NodeView implementation that adds resize handles to any DOM element.
 *
 * This class creates a resizable node view for Tiptap/ProseMirror editors.
 * It wraps your element with resize handles and manages the resize interaction,
 * including aspect ratio preservation, min/max constraints, and keyboard modifiers.
 *
 * @example
 * ```ts
 * // Basic usage in a Tiptap extension
 * addNodeView() {
 *   return ({ node, getPos }) => {
 *     const img = document.createElement('img')
 *     img.src = node.attrs.src
 *
 *     return new ResizableNodeView({
 *       element: img,
 *       node,
 *       getPos,
 *       onResize: (width, height) => {
 *         img.style.width = `${width}px`
 *         img.style.height = `${height}px`
 *       },
 *       onCommit: (width, height) => {
 *         this.editor.commands.updateAttributes('image', { width, height })
 *       },
 *       onUpdate: () => true,
 *       options: {
 *         min: { width: 100, height: 100 },
 *         preserveAspectRatio: true
 *       }
 *     })
 *   }
 * }
 * ```
 */
export class ResizableNodeView {
  /** The ProseMirror node instance */
  node: PMNode

  /** The DOM element being made resizable */
  element: HTMLElement

  /** The editable DOM element inside the DOM */
  contentElement?: HTMLElement

  /** The outer container element (returned as NodeView.dom) */
  container: HTMLElement

  /** The wrapper element that contains the element and handles */
  wrapper: HTMLElement

  /** Function to get the current node position */
  getPos: () => number | undefined

  /** Callback fired during resize */
  onResize?: (width: number, height: number) => void

  /** Callback fired when resize completes */
  onCommit: (width: number, height: number) => void

  /** Callback for node updates */
  onUpdate?: NodeView['update']

  /** Active resize handle directions */
  directions: ResizableNodeViewDirection[] = ['bottom-left', 'bottom-right', 'top-left', 'top-right']

  /** Minimum allowed dimensions */
  minSize: ResizableNodeDimensions = {
    height: 8,
    width: 8,
  }

  /** Maximum allowed dimensions (optional) */
  maxSize?: Partial<ResizableNodeDimensions>

  /** Whether to always preserve aspect ratio */
  preserveAspectRatio: boolean = false

  /** CSS class names for elements */
  classNames = {
    container: '',
    wrapper: '',
    handle: '',
    resizing: '',
  }

  /** Initial width of the element (for aspect ratio calculation) */
  private initialWidth: number = 0

  /** Initial height of the element (for aspect ratio calculation) */
  private initialHeight: number = 0

  /** Calculated aspect ratio (width / height) */
  private aspectRatio: number = 1

  /** Whether a resize operation is currently active */
  private isResizing: boolean = false

  /** The handle currently being dragged */
  private activeHandle: ResizableNodeViewDirection | null = null

  /** Starting mouse X position when resize began */
  private startX: number = 0

  /** Starting mouse Y position when resize began */
  private startY: number = 0

  /** Element width when resize began */
  private startWidth: number = 0

  /** Element height when resize began */
  private startHeight: number = 0

  /** Whether Shift key is currently pressed (for temporary aspect ratio lock) */
  private isShiftKeyPressed: boolean = false

  /**
   * Creates a new ResizableNodeView instance.
   *
   * The constructor sets up the resize handles, applies initial sizing from
   * node attributes, and configures all resize behavior options.
   *
   * @param options - Configuration options for the resizable node view
   */
  constructor(options: ResizableNodeViewOptions) {
    this.node = options.node
    this.element = options.element
    this.contentElement = options.contentElement

    this.getPos = options.getPos

    this.onResize = options.onResize
    this.onCommit = options.onCommit
    this.onUpdate = options.onUpdate

    if (options.options?.min) {
      this.minSize = {
        ...this.minSize,
        ...options.options.min,
      }
    }

    if (options.options?.max) {
      this.maxSize = options.options.max
    }

    if (options?.options?.directions) {
      this.directions = options.options.directions
    }

    if (options.options?.preserveAspectRatio) {
      this.preserveAspectRatio = options.options.preserveAspectRatio
    }

    if (options.options?.className) {
      this.classNames = {
        container: options.options.className.container || '',
        wrapper: options.options.className.wrapper || '',
        handle: options.options.className.handle || '',
        resizing: options.options.className.resizing || '',
      }
    }

    this.wrapper = this.createWrapper()
    this.container = this.createContainer()

    this.applyInitialSize()
    this.attachHandles()
  }

  /**
   * Returns the top-level DOM node that should be placed in the editor.
   *
   * This is required by the ProseMirror NodeView interface. The container
   * includes the wrapper, handles, and the actual content element.
   *
   * @returns The container element to be inserted into the editor
   */
  get dom() {
    return this.container
  }

  get contentDOM() {
    return this.contentElement
  }

  /**
   * Called when the node's content or attributes change.
   *
   * Updates the internal node reference. If a custom `onUpdate` callback
   * was provided, it will be called to handle additional update logic.
   *
   * @param node - The new/updated node
   * @param decorations - Node decorations
   * @param innerDecorations - Inner decorations
   * @returns `false` if the node type has changed (requires full rebuild), otherwise the result of `onUpdate` or `true`
   */
  update(node: PMNode, decorations: readonly Decoration[], innerDecorations: DecorationSource): boolean {
    if (node.type !== this.node.type) {
      return false
    }

    this.node = node

    if (this.onUpdate) {
      return this.onUpdate(node, decorations, innerDecorations)
    }

    return true
  }

  /**
   * Cleanup method called when the node view is being removed.
   *
   * Removes all event listeners to prevent memory leaks. This is required
   * by the ProseMirror NodeView interface. If a resize is active when
   * destroy is called, it will be properly cancelled.
   */
  destroy() {
    if (this.isResizing) {
      this.container.dataset.resizeState = 'false'

      if (this.classNames.resizing) {
        this.container.classList.remove(this.classNames.resizing)
      }

      document.removeEventListener('mousemove', this.handleMouseMove)
      document.removeEventListener('mouseup', this.handleMouseUp)
      document.removeEventListener('keydown', this.handleKeyDown)
      document.removeEventListener('keyup', this.handleKeyUp)
      this.isResizing = false
      this.activeHandle = null
    }

    this.container.remove()
  }

  /**
   * Creates the outer container element.
   *
   * The container is the top-level element returned by the NodeView and
   * wraps the entire resizable node. It's set up with flexbox to handle
   * alignment and includes data attributes for styling and identification.
   *
   * @returns The container element
   */
  createContainer() {
    const element = document.createElement('div')
    element.dataset.resizeContainer = ''
    element.dataset.node = this.node.type.name
    element.style.display = 'flex'
    element.style.justifyContent = 'flex-start'
    element.style.alignItems = 'flex-start'

    if (this.classNames.container) {
      element.className = this.classNames.container
    }

    element.appendChild(this.wrapper)

    return element
  }

  /**
   * Creates the wrapper element that contains the content and handles.
   *
   * The wrapper uses relative positioning so that resize handles can be
   * positioned absolutely within it. This is the direct parent of the
   * content element being made resizable.
   *
   * @returns The wrapper element
   */
  createWrapper() {
    const element = document.createElement('div')
    element.style.position = 'relative'
    element.style.display = 'block'
    element.dataset.resizeWrapper = ''

    if (this.classNames.wrapper) {
      element.className = this.classNames.wrapper
    }

    element.appendChild(this.element)

    return element
  }

  /**
   * Creates a resize handle element for a specific direction.
   *
   * Each handle is absolutely positioned and includes a data attribute
   * identifying its direction for styling purposes.
   *
   * @param direction - The resize direction for this handle
   * @returns The handle element
   */
  private createHandle(direction: ResizableNodeViewDirection): HTMLElement {
    const handle = document.createElement('div')
    handle.dataset.resizeHandle = direction
    handle.style.position = 'absolute'

    if (this.classNames.handle) {
      handle.className = this.classNames.handle
    }

    return handle
  }

  /**
   * Positions a handle element according to its direction.
   *
   * Corner handles (e.g., 'top-left') are positioned at the intersection
   * of two edges. Edge handles (e.g., 'top') span the full width or height.
   *
   * @param handle - The handle element to position
   * @param direction - The direction determining the position
   */
  private positionHandle(handle: HTMLElement, direction: ResizableNodeViewDirection): void {
    const isTop = direction.includes('top')
    const isBottom = direction.includes('bottom')
    const isLeft = direction.includes('left')
    const isRight = direction.includes('right')

    if (isTop) {
      handle.style.top = '0'
    }

    if (isBottom) {
      handle.style.bottom = '0'
    }

    if (isLeft) {
      handle.style.left = '0'
    }

    if (isRight) {
      handle.style.right = '0'
    }

    // Edge handles span the full width or height
    if (direction === 'top' || direction === 'bottom') {
      handle.style.left = '0'
      handle.style.right = '0'
    }

    if (direction === 'left' || direction === 'right') {
      handle.style.top = '0'
      handle.style.bottom = '0'
    }
  }

  /**
   * Creates and attaches all resize handles to the wrapper.
   *
   * Iterates through the configured directions, creates a handle for each,
   * positions it, attaches the mousedown listener, and appends it to the DOM.
   */
  private attachHandles(): void {
    this.directions.forEach(direction => {
      const handle = this.createHandle(direction)
      this.positionHandle(handle, direction)
      handle.addEventListener('mousedown', event => this.handleResizeStart(event, direction))
      handle.addEventListener('touchstart', event => this.handleResizeStart(event as unknown as MouseEvent, direction))
      this.wrapper.appendChild(handle)
    })
  }

  /**
   * Applies initial sizing from node attributes to the element.
   *
   * If width/height attributes exist on the node, they're applied to the element.
   * Otherwise, the element's natural/current dimensions are measured. The aspect
   * ratio is calculated for later use in aspect-ratio-preserving resizes.
   */
  private applyInitialSize(): void {
    const width = this.node.attrs.width as number | undefined
    const height = this.node.attrs.height as number | undefined

    if (width) {
      this.element.style.width = `${width}px`
      this.initialWidth = width
    } else {
      this.initialWidth = this.element.offsetWidth
    }

    if (height) {
      this.element.style.height = `${height}px`
      this.initialHeight = height
    } else {
      this.initialHeight = this.element.offsetHeight
    }

    // Calculate aspect ratio for use during resizing
    if (this.initialWidth > 0 && this.initialHeight > 0) {
      this.aspectRatio = this.initialWidth / this.initialHeight
    }
  }

  /**
   * Initiates a resize operation when a handle is clicked.
   *
   * Captures the starting mouse position and element dimensions, sets up
   * the resize state, adds the resizing class and state attribute, and
   * attaches document-level listeners for mouse movement and keyboard input.
   *
   * @param event - The mouse down event
   * @param direction - The direction of the handle being dragged
   */
  private handleResizeStart(event: MouseEvent | TouchEvent, direction: ResizableNodeViewDirection): void {
    event.preventDefault()
    event.stopPropagation()

    // Capture initial state
    this.isResizing = true
    this.activeHandle = direction

    if (isTouchEvent(event)) {
      this.startX = event.touches[0].clientX
      this.startY = event.touches[0].clientY
    } else {
      this.startX = event.clientX
      this.startY = event.clientY
    }

    this.startWidth = this.element.offsetWidth
    this.startHeight = this.element.offsetHeight

    // Recalculate aspect ratio at resize start for accuracy
    if (this.startWidth > 0 && this.startHeight > 0) {
      this.aspectRatio = this.startWidth / this.startHeight
    }

    const pos = this.getPos()
    if (pos !== undefined) {
      // TODO: Select the node in the editor
    }

    // Update UI state
    this.container.dataset.resizeState = 'true'

    if (this.classNames.resizing) {
      this.container.classList.add(this.classNames.resizing)
    }

    // Attach document-level listeners for resize
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('touchmove', this.handleTouchMove)
    document.addEventListener('mouseup', this.handleMouseUp)
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)
  }

  /**
   * Handles mouse movement during an active resize.
   *
   * Calculates the delta from the starting position, computes new dimensions
   * based on the active handle direction, applies constraints and aspect ratio,
   * then updates the element's style and calls the onResize callback.
   *
   * @param event - The mouse move event
   */
  private handleMouseMove = (event: MouseEvent): void => {
    if (!this.isResizing || !this.activeHandle) {
      return
    }

    const deltaX = event.clientX - this.startX
    const deltaY = event.clientY - this.startY

    this.handleResize(deltaX, deltaY)
  }

  private handleTouchMove = (event: TouchEvent): void => {
    if (!this.isResizing || !this.activeHandle) {
      return
    }

    const touch = event.touches[0]
    if (!touch) {
      return
    }

    const deltaX = touch.clientX - this.startX
    const deltaY = touch.clientY - this.startY

    this.handleResize(deltaX, deltaY)
  }

  private handleResize(deltaX: number, deltaY: number) {
    if (!this.activeHandle) {
      return
    }

    const shouldPreserveAspectRatio = this.preserveAspectRatio || this.isShiftKeyPressed
    const { width, height } = this.calculateNewDimensions(this.activeHandle, deltaX, deltaY)
    const constrained = this.applyConstraints(width, height, shouldPreserveAspectRatio)

    this.element.style.width = `${constrained.width}px`
    this.element.style.height = `${constrained.height}px`

    if (this.onResize) {
      this.onResize(constrained.width, constrained.height)
    }
  }

  /**
   * Completes the resize operation when the mouse button is released.
   *
   * Captures final dimensions, calls the onCommit callback to persist changes,
   * removes the resizing state and class, and cleans up document-level listeners.
   */
  private handleMouseUp = (): void => {
    if (!this.isResizing) {
      return
    }

    const finalWidth = this.element.offsetWidth
    const finalHeight = this.element.offsetHeight

    this.onCommit(finalWidth, finalHeight)

    this.isResizing = false
    this.activeHandle = null

    // Remove UI state
    this.container.dataset.resizeState = 'false'

    if (this.classNames.resizing) {
      this.container.classList.remove(this.classNames.resizing)
    }

    // Clean up document-level listeners
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('keyup', this.handleKeyUp)
  }

  /**
   * Tracks Shift key state to enable temporary aspect ratio locking.
   *
   * When Shift is pressed during resize, aspect ratio is preserved even if
   * preserveAspectRatio is false.
   *
   * @param event - The keyboard event
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Shift') {
      this.isShiftKeyPressed = true
    }
  }

  /**
   * Tracks Shift key release to disable temporary aspect ratio locking.
   *
   * @param event - The keyboard event
   */
  private handleKeyUp = (event: KeyboardEvent): void => {
    if (event.key === 'Shift') {
      this.isShiftKeyPressed = false
    }
  }

  /**
   * Calculates new dimensions based on mouse delta and resize direction.
   *
   * Takes the starting dimensions and applies the mouse movement delta
   * according to the handle direction. For corner handles, both dimensions
   * are affected. For edge handles, only one dimension changes. If aspect
   * ratio should be preserved, delegates to applyAspectRatio.
   *
   * @param direction - The active resize handle direction
   * @param deltaX - Horizontal mouse movement since resize start
   * @param deltaY - Vertical mouse movement since resize start
   * @returns The calculated width and height
   */
  private calculateNewDimensions(
    direction: ResizableNodeViewDirection,
    deltaX: number,
    deltaY: number,
  ): ResizableNodeDimensions {
    let newWidth = this.startWidth
    let newHeight = this.startHeight

    const isRight = direction.includes('right')
    const isLeft = direction.includes('left')
    const isBottom = direction.includes('bottom')
    const isTop = direction.includes('top')

    // Apply horizontal delta
    if (isRight) {
      newWidth = this.startWidth + deltaX
    } else if (isLeft) {
      newWidth = this.startWidth - deltaX
    }

    // Apply vertical delta
    if (isBottom) {
      newHeight = this.startHeight + deltaY
    } else if (isTop) {
      newHeight = this.startHeight - deltaY
    }

    // For pure horizontal/vertical handles, only one dimension changes
    if (direction === 'right' || direction === 'left') {
      newWidth = this.startWidth + (isRight ? deltaX : -deltaX)
    }

    if (direction === 'top' || direction === 'bottom') {
      newHeight = this.startHeight + (isBottom ? deltaY : -deltaY)
    }

    const shouldPreserveAspectRatio = this.preserveAspectRatio || this.isShiftKeyPressed

    if (shouldPreserveAspectRatio) {
      return this.applyAspectRatio(newWidth, newHeight, direction)
    }

    return { width: newWidth, height: newHeight }
  }

  /**
   * Applies min/max constraints to dimensions.
   *
   * When aspect ratio is NOT preserved, constraints are applied independently
   * to width and height. When aspect ratio IS preserved, constraints are
   * applied while maintaining the aspect ratio—if one dimension hits a limit,
   * the other is recalculated proportionally.
   *
   * This ensures that aspect ratio is never broken when constrained.
   *
   * @param width - The unconstrained width
   * @param height - The unconstrained height
   * @param preserveAspectRatio - Whether to maintain aspect ratio while constraining
   * @returns The constrained dimensions
   */
  private applyConstraints(width: number, height: number, preserveAspectRatio: boolean): ResizableNodeDimensions {
    if (!preserveAspectRatio) {
      // Independent constraints for each dimension
      let constrainedWidth = Math.max(this.minSize.width, width)
      let constrainedHeight = Math.max(this.minSize.height, height)

      if (this.maxSize?.width) {
        constrainedWidth = Math.min(this.maxSize.width, constrainedWidth)
      }

      if (this.maxSize?.height) {
        constrainedHeight = Math.min(this.maxSize.height, constrainedHeight)
      }

      return { width: constrainedWidth, height: constrainedHeight }
    }

    // Aspect-ratio-aware constraints: adjust both dimensions proportionally
    let constrainedWidth = width
    let constrainedHeight = height

    // Check minimum constraints
    if (constrainedWidth < this.minSize.width) {
      constrainedWidth = this.minSize.width
      constrainedHeight = constrainedWidth / this.aspectRatio
    }

    if (constrainedHeight < this.minSize.height) {
      constrainedHeight = this.minSize.height
      constrainedWidth = constrainedHeight * this.aspectRatio
    }

    // Check maximum constraints
    if (this.maxSize?.width && constrainedWidth > this.maxSize.width) {
      constrainedWidth = this.maxSize.width
      constrainedHeight = constrainedWidth / this.aspectRatio
    }

    if (this.maxSize?.height && constrainedHeight > this.maxSize.height) {
      constrainedHeight = this.maxSize.height
      constrainedWidth = constrainedHeight * this.aspectRatio
    }

    return { width: constrainedWidth, height: constrainedHeight }
  }

  /**
   * Adjusts dimensions to maintain the original aspect ratio.
   *
   * For horizontal handles (left/right), uses width as the primary dimension
   * and calculates height from it. For vertical handles (top/bottom), uses
   * height as primary and calculates width. For corner handles, uses width
   * as the primary dimension.
   *
   * @param width - The new width
   * @param height - The new height
   * @param direction - The active resize direction
   * @returns Dimensions adjusted to preserve aspect ratio
   */
  private applyAspectRatio(
    width: number,
    height: number,
    direction: ResizableNodeViewDirection,
  ): ResizableNodeDimensions {
    const isHorizontal = direction === 'left' || direction === 'right'
    const isVertical = direction === 'top' || direction === 'bottom'

    if (isHorizontal) {
      // For horizontal resize, width is primary
      return {
        width,
        height: width / this.aspectRatio,
      }
    }

    if (isVertical) {
      // For vertical resize, height is primary
      return {
        width: height * this.aspectRatio,
        height,
      }
    }

    // For corner resize, width is primary
    return {
      width,
      height: width / this.aspectRatio,
    }
  }
}

/**
 * Alias for ResizableNodeView to maintain consistent naming.
 * @deprecated Use ResizableNodeView instead - will be removed in future versions.
 */
export const ResizableNodeview = ResizableNodeView
