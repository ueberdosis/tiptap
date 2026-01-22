import { Extension } from '../Extension.js'
import { isRectInViewport } from '../helpers/canvasTransform.js'

export interface CanvasViewportCullingOptions {
  /**
   * Whether viewport culling is enabled
   * @default true
   */
  enabled: boolean

  /**
   * Buffer around the viewport to render editors (in pixels)
   * @default 100
   */
  viewportBuffer: number

  /**
   * Whether to debounce viewport updates
   * @default true
   */
  debounce: boolean

  /**
   * Debounce delay in milliseconds
   * @default 150
   */
  debounceDelay: number

  /**
   * Whether to hide the editor element when culled
   * @default true
   */
  hideWhenCulled: boolean

  /**
   * Whether to disable the editor when culled
   * @default false
   */
  disableWhenCulled: boolean

  /**
   * Callback when editor becomes visible
   */
  onVisible?: () => void

  /**
   * Callback when editor becomes hidden
   */
  onHidden?: () => void
}

export const CanvasViewportCulling = Extension.create<CanvasViewportCullingOptions>({
  name: 'canvasViewportCulling',

  addOptions() {
    return {
      enabled: true,
      viewportBuffer: 100,
      debounce: true,
      debounceDelay: 150,
      hideWhenCulled: true,
      disableWhenCulled: false,
      onVisible: undefined,
      onHidden: undefined,
    }
  },

  addStorage() {
    return {
      isVisible: true,
      debounceTimeout: null as ReturnType<typeof setTimeout> | null,
    }
  },

  onCreate() {
    // Initial visibility check
    this.checkVisibilityInternal()

    // Listen for viewport changes
    this.editor.on('canvasViewportChange', () => {
      if (this.options.debounce) {
        this.debouncedVisibilityCheckInternal()
      } else {
        this.checkVisibilityInternal()
      }
    })

    // Listen for canvas zoom changes
    this.editor.on('canvasZoom', () => {
      if (this.options.debounce) {
        this.debouncedVisibilityCheckInternal()
      } else {
        this.checkVisibilityInternal()
      }
    })

    // Listen for node position changes
    this.editor.on('canvasNodeMove', () => {
      if (this.options.debounce) {
        this.debouncedVisibilityCheckInternal()
      } else {
        this.checkVisibilityInternal()
      }
    })
  },

  onDestroy() {
    // Clear any pending debounce
    if (this.storage.debounceTimeout) {
      clearTimeout(this.storage.debounceTimeout)
    }
  },

  addCommands() {
    return {
      checkVisibility: () => () => {
        this.checkVisibilityInternal()
        return true
      },

      forceVisibilityCheck: () => () => {
        // Clear any pending debounce
        if (this.storage.debounceTimeout) {
          clearTimeout(this.storage.debounceTimeout)
          this.storage.debounceTimeout = null
        }
        this.checkVisibilityInternal()
        return true
      },

      isEditorVisible: () => () => {
        return this.storage.isVisible
      },
    }
  },

  // Internal helper methods
  checkVisibilityInternal() {
    if (!this.options.enabled || !this.editor.canvasContext) {
      return
    }

    const canvasContext = this.editor.canvasContext
    const { viewport, node } = canvasContext

    // Calculate if editor is in viewport with buffer
    const bufferedViewport = {
      ...viewport,
      offset: {
        x: viewport.offset.x - this.options.viewportBuffer,
        y: viewport.offset.y - this.options.viewportBuffer,
      },
      size: {
        width: viewport.size.width + this.options.viewportBuffer * 2,
        height: viewport.size.height + this.options.viewportBuffer * 2,
      },
    }

    const nodeRect = {
      x: node.position.x,
      y: node.position.y,
      width: node.size.width,
      height: node.size.height,
    }

    const isVisible = isRectInViewport(nodeRect, bufferedViewport)
    const wasVisible = this.storage.isVisible

    if (isVisible !== wasVisible) {
      this.storage.isVisible = isVisible

      // Update canvas context visibility
      this.editor.updateCanvasVisibility(isVisible)

      // Apply visibility changes
      if (this.options.hideWhenCulled) {
        const editorElement = this.editor.view.dom as HTMLElement
        if (editorElement) {
          editorElement.style.display = isVisible ? '' : 'none'
        }
      }

      if (this.options.disableWhenCulled) {
        this.editor.setEditable(isVisible)
      }

      // Call callbacks
      if (isVisible && this.options.onVisible) {
        this.options.onVisible()
      } else if (!isVisible && this.options.onHidden) {
        this.options.onHidden()
      }
    }
  },

  debouncedVisibilityCheckInternal() {
    if (this.storage.debounceTimeout) {
      clearTimeout(this.storage.debounceTimeout)
    }

    this.storage.debounceTimeout = setTimeout(() => {
      this.checkVisibilityInternal()
      this.storage.debounceTimeout = null
    }, this.options.debounceDelay)
  },
})

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    canvasViewportCulling: {
      /**
       * Check if the editor is visible in the canvas viewport
       */
      checkVisibility: () => ReturnType
      /**
       * Force an immediate visibility check (bypasses debouncing)
       */
      forceVisibilityCheck: () => ReturnType
      /**
       * Check if the editor is currently visible
       */
      isEditorVisible: () => ReturnType
    }
  }
}
