import type { Editor } from '../Editor.js'
import { Extension } from '../Extension.js'
import type { Point } from '../types/canvas.js'

export interface SelectionRange {
  editor: Editor
  from: number
  to: number
  nodeId: string
}

export interface CanvasSelectionOptions {
  /**
   * Whether multi-editor selection is enabled
   * @default true
   */
  enabled: boolean

  /**
   * Whether to allow selection across multiple editors
   * @default true
   */
  allowCrossEditorSelection: boolean

  /**
   * CSS class to apply to selected content across editors
   * @default 'canvas-multi-selection'
   */
  selectionClass: string

  /**
   * Callback when selection changes
   */
  onSelectionChange?: (selections: SelectionRange[]) => void

  /**
   * Callback when cross-editor selection starts
   */
  onCrossEditorSelectionStart?: (editor: Editor) => void

  /**
   * Callback when cross-editor selection ends
   */
  onCrossEditorSelectionEnd?: (selections: SelectionRange[]) => void
}

export const CanvasSelection = Extension.create<CanvasSelectionOptions>({
  name: 'canvasSelection',

  addOptions() {
    return {
      enabled: true,
      allowCrossEditorSelection: true,
      selectionClass: 'canvas-multi-selection',
      onSelectionChange: undefined,
      onCrossEditorSelectionStart: undefined,
      onCrossEditorSelectionEnd: undefined,
    }
  },

  addStorage() {
    return {
      selections: [] as SelectionRange[],
      isMultiSelecting: false,
      selectionStartPoint: null as Point | null,
      selectionEndPoint: null as Point | null,
    }
  },

  addCommands() {
    return {
      /**
       * Add a selection range to the multi-editor selection
       */
      addSelection: (editor: Editor, from: number, to: number) => () => {
        if (!this.options.enabled) {return false}

        const nodeId = editor.canvasContext?.node.id
        if (!nodeId) {return false}

        const existingIndex = this.storage.selections.findIndex(s => s.editor === editor)

        const newSelection: SelectionRange = {
          editor,
          from,
          to,
          nodeId,
        }

        if (existingIndex >= 0) {
          // Update existing selection
          this.storage.selections[existingIndex] = newSelection
        } else {
          // Add new selection
          this.storage.selections.push(newSelection)
        }

        if (this.options.onSelectionChange) {
          this.options.onSelectionChange(this.storage.selections)
        }

        return true
      },

      /**
       * Remove a selection range from the multi-editor selection
       */
      removeSelection: (editor: Editor) => () => {
        if (!this.options.enabled) {return false}

        const index = this.storage.selections.findIndex(s => s.editor === editor)
        if (index >= 0) {
          this.storage.selections.splice(index, 1)

          if (this.options.onSelectionChange) {
            this.options.onSelectionChange(this.storage.selections)
          }
        }

        return true
      },

      /**
       * Clear all selections
       */
      clearSelections: () => () => {
        if (!this.options.enabled) {return false}

        this.storage.selections = []
        this.storage.isMultiSelecting = false

        if (this.options.onSelectionChange) {
          this.options.onSelectionChange([])
        }

        return true
      },

      /**
       * Get all current selections
       */
      getSelections: () => () => {
        return this.storage.selections
      },

      /**
       * Check if multi-editor selection is active
       */
      isMultiSelecting: () => () => {
        return this.storage.isMultiSelecting
      },

      /**
       * Start cross-editor selection mode
       */
      startCrossEditorSelection:
        () =>
        ({ editor }) => {
          if (!this.options.enabled || !this.options.allowCrossEditorSelection) {
            return false
          }

          this.storage.isMultiSelecting = true

          if (this.options.onCrossEditorSelectionStart) {
            this.options.onCrossEditorSelectionStart(editor)
          }

          return true
        },

      /**
       * End cross-editor selection mode
       */
      endCrossEditorSelection: () => () => {
        if (!this.options.enabled) {return false}

        this.storage.isMultiSelecting = false

        if (this.options.onCrossEditorSelectionEnd) {
          this.options.onCrossEditorSelectionEnd(this.storage.selections)
        }

        return true
      },

      /**
       * Copy content from all selections
       */
      copyMultiSelection: () => () => {
        if (!this.options.enabled || this.storage.selections.length === 0) {
          return false
        }

        // Collect all selected content
        const contents = this.storage.selections.map(selection => {
          const { editor, from, to } = selection
          return editor.state.doc.textBetween(from, to)
        })

        // Join with newlines
        const combinedContent = contents.join('\n')

        // Copy to clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(combinedContent)
        }

        return true
      },

      /**
       * Delete content from all selections
       */
      deleteMultiSelection: () => () => {
        if (!this.options.enabled || this.storage.selections.length === 0) {
          return false
        }

        // Delete from each editor
        this.storage.selections.forEach(selection => {
          const { editor, from, to } = selection
          const tr = editor.state.tr.delete(from, to)
          editor.view.dispatch(tr)
        })

        // Clear selections
        this.storage.selections = []

        if (this.options.onSelectionChange) {
          this.options.onSelectionChange([])
        }

        return true
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      // Copy multi-selection with Cmd/Ctrl+C
      'Mod-c': () => {
        if (this.storage.isMultiSelecting && this.storage.selections.length > 1) {
          // @ts-ignore - copyMultiSelection command is added by this extension
          return this.editor.commands.copyMultiSelection()
        }
        return false
      },

      // Delete multi-selection with Backspace/Delete
      Backspace: () => {
        if (this.storage.isMultiSelecting && this.storage.selections.length > 1) {
          // @ts-ignore - deleteMultiSelection command is added by this extension
          return this.editor.commands.deleteMultiSelection()
        }
        return false
      },

      Delete: () => {
        if (this.storage.isMultiSelecting && this.storage.selections.length > 1) {
          // @ts-ignore - deleteMultiSelection command is added by this extension
          return this.editor.commands.deleteMultiSelection()
        }
        return false
      },

      // Escape to clear multi-selection
      Escape: () => {
        if (this.storage.isMultiSelecting) {
          // @ts-ignore - clearSelections command is added by this extension
          return this.editor.commands.clearSelections()
        }
        return false
      },
    }
  },
})

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    canvasSelection: {
      /**
       * Add a selection range to the multi-editor selection
       */
      addSelection: (editor: Editor, from: number, to: number) => ReturnType
      /**
       * Remove a selection range from the multi-editor selection
       */
      removeSelection: (editor: Editor) => ReturnType
      /**
       * Clear all selections
       */
      clearSelections: () => ReturnType
      /**
       * Get all current selections
       */
      getSelections: () => ReturnType
      /**
       * Check if multi-editor selection is active
       */
      isMultiSelecting: () => ReturnType
      /**
       * Start cross-editor selection mode
       */
      startCrossEditorSelection: () => ReturnType
      /**
       * End cross-editor selection mode
       */
      endCrossEditorSelection: () => ReturnType
      /**
       * Copy content from all selections
       */
      copyMultiSelection: () => ReturnType
      /**
       * Delete content from all selections
       */
      deleteMultiSelection: () => ReturnType
    }
  }
}
