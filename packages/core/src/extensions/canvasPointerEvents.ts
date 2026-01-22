import { Extension } from '../Extension.js'
import type { CanvasContext, Point } from '../types/canvas.js'

export interface CanvasPointerEventData {
  screenPoint: Point
  canvasPoint: Point
  editorPoint: Point
  originalEvent: PointerEvent
  canvasContext: CanvasContext
  editorElement: HTMLElement
}

export interface CanvasPointerEventsOptions {
  /**
   * Whether to handle pointer events on the canvas
   * @default true
   */
  enabled: boolean

  /**
   * Whether to stop event propagation to prevent canvas interactions
   * @default false
   */
  stopPropagation: boolean

  /**
   * Whether to prevent default browser behavior
   * @default false
   */
  preventDefault: boolean

  /**
   * Callback when pointer down occurs on the editor
   */
  onPointerDown?: (data: CanvasPointerEventData) => boolean | void

  /**
   * Callback when pointer moves over the editor
   */
  onPointerMove?: (data: CanvasPointerEventData) => boolean | void

  /**
   * Callback when pointer up occurs on the editor
   */
  onPointerUp?: (data: CanvasPointerEventData) => boolean | void

  /**
   * Callback when pointer enters the editor
   */
  onPointerEnter?: (data: CanvasPointerEventData) => boolean | void

  /**
   * Callback when pointer leaves the editor
   */
  onPointerLeave?: (data: CanvasPointerEventData) => boolean | void

  /**
   * Callback when click occurs on the editor
   */
  onClick?: (data: CanvasPointerEventData) => boolean | void

  /**
   * Callback when double click occurs on the editor
   */
  onDoubleClick?: (data: CanvasPointerEventData) => boolean | void
}

export const CanvasPointerEvents = Extension.create<CanvasPointerEventsOptions>({
  name: 'canvasPointerEvents',

  addOptions() {
    return {
      enabled: true,
      stopPropagation: false,
      preventDefault: false,
      onPointerDown: undefined,
      onPointerMove: undefined,
      onPointerUp: undefined,
      onPointerEnter: undefined,
      onPointerLeave: undefined,
      onClick: undefined,
      onDoubleClick: undefined,
    }
  },

  addProseMirrorPlugins() {
    const { editor } = this

    return [
      {
        key: 'canvasPointerEvents',
        props: {
          handleDOMEvents: {
            pointerdown: (view, event) => {
              if (!this.options.enabled || !editor.canvasContext) {
                return false
              }

              const data = this.createEventData(event)
              if (!data) {return false}

              if (this.options.onPointerDown) {
                const result = this.options.onPointerDown(data)
                if (result === true) {return true}
              }

              if (this.options.stopPropagation) {
                event.stopPropagation()
              }
              if (this.options.preventDefault) {
                event.preventDefault()
              }

              return false
            },

            pointermove: (view, event) => {
              if (!this.options.enabled || !editor.canvasContext) {
                return false
              }

              const data = this.createEventData(event)
              if (!data) {return false}

              if (this.options.onPointerMove) {
                const result = this.options.onPointerMove(data)
                if (result === true) {return true}
              }

              if (this.options.stopPropagation) {
                event.stopPropagation()
              }
              if (this.options.preventDefault) {
                event.preventDefault()
              }

              return false
            },

            pointerup: (view, event) => {
              if (!this.options.enabled || !editor.canvasContext) {
                return false
              }

              const data = this.createEventData(event)
              if (!data) {return false}

              if (this.options.onPointerUp) {
                const result = this.options.onPointerUp(data)
                if (result === true) {return true}
              }

              if (this.options.stopPropagation) {
                event.stopPropagation()
              }
              if (this.options.preventDefault) {
                event.preventDefault()
              }

              return false
            },

            pointerenter: (view, event) => {
              if (!this.options.enabled || !editor.canvasContext) {
                return false
              }

              const data = this.createEventData(event)
              if (!data) {return false}

              if (this.options.onPointerEnter) {
                const result = this.options.onPointerEnter(data)
                if (result === true) {return true}
              }

              return false
            },

            pointerleave: (view, event) => {
              if (!this.options.enabled || !editor.canvasContext) {
                return false
              }

              const data = this.createEventData(event)
              if (!data) {return false}

              if (this.options.onPointerLeave) {
                const result = this.options.onPointerLeave(data)
                if (result === true) {return true}
              }

              return false
            },

            click: (view, event) => {
              if (!this.options.enabled || !editor.canvasContext) {
                return false
              }

              const data = this.createEventData(event as PointerEvent)
              if (!data) {return false}

              if (this.options.onClick) {
                const result = this.options.onClick(data)
                if (result === true) {return true}
              }

              if (this.options.stopPropagation) {
                event.stopPropagation()
              }
              if (this.options.preventDefault) {
                event.preventDefault()
              }

              return false
            },

            dblclick: (view, event) => {
              if (!this.options.enabled || !editor.canvasContext) {
                return false
              }

              const data = this.createEventData(event as PointerEvent)
              if (!data) {return false}

              if (this.options.onDoubleClick) {
                const result = this.options.onDoubleClick(data)
                if (result === true) {return true}
              }

              if (this.options.stopPropagation) {
                event.stopPropagation()
              }
              if (this.options.preventDefault) {
                event.preventDefault()
              }

              return false
            },
          },
        },
      },
    ]
  },

  addMethods() {
    return {
      createEventData: (event: PointerEvent): CanvasPointerEventData | null => {
        const { editor } = this
        const canvasContext = editor.canvasContext
        const editorElement = editor.view.dom as HTMLElement

        if (!canvasContext || !editorElement) {
          return null
        }

        const screenPoint: Point = {
          x: event.clientX,
          y: event.clientY,
        }

        const canvasPoint = canvasContext.transform.screenToCanvas(screenPoint)
        const editorPoint = canvasContext.transform.screenToEditor(screenPoint)

        return {
          screenPoint,
          canvasPoint,
          editorPoint,
          originalEvent: event,
          canvasContext,
          editorElement,
        }
      },
    }
  },
})

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    canvasPointerEvents: {
      /**
       * Create event data from a pointer event
       */
      createEventData: (event: PointerEvent) => ReturnType
    }
  }
}
