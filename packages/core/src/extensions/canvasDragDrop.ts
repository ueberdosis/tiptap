import { Plugin, PluginKey } from '@dibdab/pm/state'

import type { Editor } from '../Editor.js'
import { Extension } from '../Extension.js'
import type { Point } from '../types/canvas.js'

export interface CanvasDragDropOptions {
  /**
   * Whether canvas-aware drag and drop is enabled
   * @default true
   */
  enabled: boolean

  /**
   * Whether to allow dragging content between editors on the same canvas
   * @default true
   */
  allowCrossEditorDrag: boolean

  /**
   * Whether to show a drag preview
   * @default true
   */
  showDragPreview: boolean

  /**
   * Callback when drag starts
   */
  onDragStart?: (data: DragDropData) => void

  /**
   * Callback when dragging over an editor
   */
  onDragOver?: (data: DragDropData) => boolean | void

  /**
   * Callback when drop occurs
   */
  onDrop?: (data: DragDropData) => boolean | void

  /**
   * Callback when drag ends
   */
  onDragEnd?: (data: DragDropData) => void

  /**
   * Custom drag data serializer
   */
  serializeDragData?: (content: any) => string

  /**
   * Custom drag data deserializer
   */
  deserializeDragData?: (dataTransfer: DataTransfer) => any
}

export interface DragDropData {
  sourceEditor: Editor | null
  targetEditor: Editor | null
  content: any
  sourceCanvasPoint: Point | null
  targetCanvasPoint: Point | null
  dataTransfer: DataTransfer
  event: DragEvent
}

const canvasDragDropPluginKey = new PluginKey('canvasDragDrop')

export const CanvasDragDrop = Extension.create<CanvasDragDropOptions>({
  name: 'canvasDragDrop',

  addOptions() {
    return {
      enabled: true,
      allowCrossEditorDrag: true,
      showDragPreview: true,
      onDragStart: undefined,
      onDragOver: undefined,
      onDrop: undefined,
      onDragEnd: undefined,
      serializeDragData: undefined,
      deserializeDragData: undefined,
    }
  },

  addStorage() {
    return {
      isDragging: false,
      dragSourceEditor: null as Editor | null,
      dragContent: null as any,
      dragStartPoint: null as Point | null,
    }
  },

  addProseMirrorPlugins() {
    const { editor } = this

    return [
      new Plugin({
        key: canvasDragDropPluginKey,
        props: {
          handleDOMEvents: {
            dragstart: (view, event) => {
              if (!this.options.enabled) {return false}

              const canvasContext = editor.canvasContext
              if (!canvasContext) {return false}

              const screenPoint: Point = {
                x: event.clientX,
                y: event.clientY,
              }

              const canvasPoint = canvasContext.transform.screenToCanvas(screenPoint)

              this.storage.isDragging = true
              this.storage.dragSourceEditor = editor
              this.storage.dragStartPoint = canvasPoint

              // Get selected content
              const { from, to } = view.state.selection
              const content = view.state.doc.slice(from, to)

              this.storage.dragContent = content

              // Serialize content to data transfer
              if (event.dataTransfer) {
                const serialized = this.options.serializeDragData
                  ? this.options.serializeDragData(content)
                  : JSON.stringify(content.toJSON())

                event.dataTransfer.setData('application/x-dibdab-content', serialized)
                event.dataTransfer.setData('text/plain', view.state.doc.textBetween(from, to))
                event.dataTransfer.effectAllowed = 'copyMove'
              }

              // Callback
              if (this.options.onDragStart) {
                this.options.onDragStart({
                  sourceEditor: editor,
                  targetEditor: null,
                  content,
                  sourceCanvasPoint: canvasPoint,
                  targetCanvasPoint: null,
                  dataTransfer: event.dataTransfer!,
                  event,
                })
              }

              return false
            },

            dragover: (view, event) => {
              if (!this.options.enabled) {return false}

              const canvasContext = editor.canvasContext
              if (!canvasContext) {return false}

              // Check if this is a cross-editor drag
              const isCrossEditorDrag = this.storage.dragSourceEditor && this.storage.dragSourceEditor !== editor

              if (isCrossEditorDrag && !this.options.allowCrossEditorDrag) {
                return false
              }

              const screenPoint: Point = {
                x: event.clientX,
                y: event.clientY,
              }

              const canvasPoint = canvasContext.transform.screenToCanvas(screenPoint)

              // Prevent default to allow drop
              event.preventDefault()

              if (event.dataTransfer) {
                event.dataTransfer.dropEffect = isCrossEditorDrag ? 'move' : 'copy'
              }

              // Callback
              if (this.options.onDragOver) {
                const result = this.options.onDragOver({
                  sourceEditor: this.storage.dragSourceEditor,
                  targetEditor: editor,
                  content: this.storage.dragContent,
                  sourceCanvasPoint: this.storage.dragStartPoint,
                  targetCanvasPoint: canvasPoint,
                  dataTransfer: event.dataTransfer!,
                  event,
                })

                if (result === true) {return true}
              }

              return false
            },

            drop: (view, event) => {
              if (!this.options.enabled) {return false}

              const canvasContext = editor.canvasContext
              if (!canvasContext) {return false}

              event.preventDefault()

              const screenPoint: Point = {
                x: event.clientX,
                y: event.clientY,
              }

              const canvasPoint = canvasContext.transform.screenToCanvas(screenPoint)

              // Try to get content from data transfer
              let content = this.storage.dragContent

              if (event.dataTransfer) {
                const dibdabData = event.dataTransfer.getData('application/x-dibdab-content')

                if (dibdabData) {
                  content = this.options.deserializeDragData
                    ? this.options.deserializeDragData(event.dataTransfer)
                    : JSON.parse(dibdabData)
                }
              }

              // Callback
              if (this.options.onDrop) {
                const result = this.options.onDrop({
                  sourceEditor: this.storage.dragSourceEditor,
                  targetEditor: editor,
                  content,
                  sourceCanvasPoint: this.storage.dragStartPoint,
                  targetCanvasPoint: canvasPoint,
                  dataTransfer: event.dataTransfer!,
                  event,
                })

                if (result === true) {
                  this.resetDragState()
                  return true
                }
              }

              this.resetDragState()
              return false
            },

            dragend: (view, event) => {
              if (!this.options.enabled || !this.storage.isDragging) {return false}

              const canvasContext = editor.canvasContext
              if (!canvasContext) {
                this.resetDragState()
                return false
              }

              // Callback
              if (this.options.onDragEnd) {
                this.options.onDragEnd({
                  sourceEditor: this.storage.dragSourceEditor,
                  targetEditor: null,
                  content: this.storage.dragContent,
                  sourceCanvasPoint: this.storage.dragStartPoint,
                  targetCanvasPoint: null,
                  dataTransfer: event.dataTransfer!,
                  event,
                })
              }

              this.resetDragState()
              return false
            },
          },
        },
      }),
    ]
  },

  addMethods() {
    return {
      resetDragState: () => {
        this.storage.isDragging = false
        this.storage.dragSourceEditor = null
        this.storage.dragContent = null
        this.storage.dragStartPoint = null
      },

      isDragging: (): boolean => {
        return this.storage.isDragging
      },

      getDragSource: (): Editor | null => {
        return this.storage.dragSourceEditor
      },
    }
  },
})

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    canvasDragDrop: {
      /**
       * Check if a drag operation is in progress
       */
      isDragging: () => ReturnType
      /**
       * Get the source editor of the current drag operation
       */
      getDragSource: () => ReturnType
    }
  }
}

export { canvasDragDropPluginKey }
