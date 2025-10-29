import type { Node as PMNode } from '@tiptap/pm/model'
import type { Decoration, DecorationSource, NodeView } from '@tiptap/pm/view'

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
 * Configuration options for creating a ResizableNodeview
 *
 * @example
 * ```ts
 * new ResizableNodeview({
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
  onResize: (width: number, height: number) => void

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
 *     return new ResizableNodeview({
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
export class ResizableNodeview {
  /** The ProseMirror node instance */
  node: PMNode

  /** The DOM element being made resizable */
  element: HTMLElement

  /** The outer container element (returned as NodeView.dom) */
  container: HTMLElement

  /** The wrapper element that contains the element and handles */
  wrapper: HTMLElement

  /** Function to get the current node position */
  getPos: () => number | undefined

  /** Callback fired during resize */
  onResize: (width: number, height: number) => void

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
   * Creates a new ResizableNodeview instance.
   *
   * The constructor sets up the resize handles, applies initial sizing from
   * node attributes, and configures all resize behavior options.
   *
   * @param options - Configuration options for the resizable node view
   */
  constructor(options: ResizableNodeViewOptions) {
    this.node = options.node
    this.element = options.element

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

  get dom() {
    return this.container
  }

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

  private createHandle(direction: ResizableNodeViewDirection): HTMLElement {
    const handle = document.createElement('div')
    handle.dataset.resizeHandle = direction
    handle.style.position = 'absolute'

    if (this.classNames.handle) {
      handle.className = this.classNames.handle
    }

    return handle
  }

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

    if (direction === 'top' || direction === 'bottom') {
      handle.style.left = '0'
      handle.style.right = '0'
    }

    if (direction === 'left' || direction === 'right') {
      handle.style.top = '0'
      handle.style.bottom = '0'
    }
  }

  private attachHandles(): void {
    this.directions.forEach(direction => {
      const handle = this.createHandle(direction)
      this.positionHandle(handle, direction)
      handle.addEventListener('mousedown', event => this.handleMouseDown(event, direction))
      this.wrapper.appendChild(handle)
    })
  }

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

    if (this.initialWidth > 0 && this.initialHeight > 0) {
      this.aspectRatio = this.initialWidth / this.initialHeight
    }
  }

  private handleMouseDown(event: MouseEvent, direction: ResizableNodeViewDirection): void {
    event.preventDefault()
    event.stopPropagation()

    this.isResizing = true
    this.activeHandle = direction

    this.startX = event.clientX
    this.startY = event.clientY
    this.startWidth = this.element.offsetWidth
    this.startHeight = this.element.offsetHeight

    if (this.startWidth > 0 && this.startHeight > 0) {
      this.aspectRatio = this.startWidth / this.startHeight
    }

    const pos = this.getPos()
    if (pos !== undefined) {
      // TODO: Select the node in the editor
    }

    this.container.dataset.resizeState = 'true'

    if (this.classNames.resizing) {
      this.container.classList.add(this.classNames.resizing)
    }

    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)
  }

  private handleMouseMove = (event: MouseEvent): void => {
    if (!this.isResizing || !this.activeHandle) {
      return
    }

    const deltaX = event.clientX - this.startX
    const deltaY = event.clientY - this.startY

    const shouldPreserveAspectRatio = this.preserveAspectRatio || this.isShiftKeyPressed
    const { width, height } = this.calculateNewDimensions(this.activeHandle, deltaX, deltaY)
    const constrained = this.applyConstraints(width, height, shouldPreserveAspectRatio)

    this.element.style.width = `${constrained.width}px`
    this.element.style.height = `${constrained.height}px`

    this.onResize(constrained.width, constrained.height)
  }

  private handleMouseUp = (): void => {
    if (!this.isResizing) {
      return
    }

    const finalWidth = this.element.offsetWidth
    const finalHeight = this.element.offsetHeight

    this.onCommit(finalWidth, finalHeight)

    this.isResizing = false
    this.activeHandle = null

    this.container.dataset.resizeState = 'false'

    if (this.classNames.resizing) {
      this.container.classList.remove(this.classNames.resizing)
    }

    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('keyup', this.handleKeyUp)
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Shift') {
      this.isShiftKeyPressed = true
    }
  }

  private handleKeyUp = (event: KeyboardEvent): void => {
    if (event.key === 'Shift') {
      this.isShiftKeyPressed = false
    }
  }

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

    if (isRight) {
      newWidth = this.startWidth + deltaX
    } else if (isLeft) {
      newWidth = this.startWidth - deltaX
    }

    if (isBottom) {
      newHeight = this.startHeight + deltaY
    } else if (isTop) {
      newHeight = this.startHeight - deltaY
    }

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

  private applyConstraints(width: number, height: number, preserveAspectRatio: boolean): ResizableNodeDimensions {
    if (!preserveAspectRatio) {
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

    // When preserving aspect ratio, we need to check which dimension hits the limit first
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

  private applyAspectRatio(
    width: number,
    height: number,
    direction: ResizableNodeViewDirection,
  ): ResizableNodeDimensions {
    const isHorizontal = direction === 'left' || direction === 'right'
    const isVertical = direction === 'top' || direction === 'bottom'

    if (isHorizontal) {
      return {
        width,
        height: width / this.aspectRatio,
      }
    }

    if (isVertical) {
      return {
        width: height * this.aspectRatio,
        height,
      }
    }

    return {
      width,
      height: width / this.aspectRatio,
    }
  }
}
