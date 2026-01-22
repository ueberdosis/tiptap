import type { Editor } from '../Editor.js'

export interface FocusManagerOptions {
  /**
   * Whether to auto-focus when clicking on an editor
   * @default true
   */
  autoFocus?: boolean

  /**
   * Whether to blur other editors when focusing one
   * @default true
   */
  exclusiveFocus?: boolean

  /**
   * Callback when focus changes between editors
   */
  onFocusChange?: (editor: Editor | null, previousEditor: Editor | null) => void

  /**
   * Callback when an editor is registered
   */
  onEditorRegistered?: (editor: Editor) => void

  /**
   * Callback when an editor is unregistered
   */
  onEditorUnregistered?: (editor: Editor) => void
}

/**
 * Manages focus across multiple editors on a canvas
 */
export class CanvasFocusManager {
  private editors: Map<string, Editor> = new Map()
  private focusedEditor: Editor | null = null
  private options: FocusManagerOptions

  constructor(options: FocusManagerOptions = {}) {
    this.options = {
      autoFocus: true,
      exclusiveFocus: true,
      ...options,
    }
  }

  /**
   * Register an editor with the focus manager
   */
  registerEditor(editor: Editor): void {
    if (!editor.canvasContext?.node.id) {
      console.warn('CanvasFocusManager: Editor must have a canvas context with a node ID')
      return
    }

    const nodeId = editor.canvasContext.node.id
    this.editors.set(nodeId, editor)

    // Add focus event listener if autoFocus is enabled
    if (this.options.autoFocus) {
      editor.on('focus', () => {
        this.setFocusedEditor(editor)
      })
    }

    if (this.options.onEditorRegistered) {
      this.options.onEditorRegistered(editor)
    }
  }

  /**
   * Unregister an editor from the focus manager
   */
  unregisterEditor(editor: Editor | string): void {
    const nodeId = typeof editor === 'string' ? editor : editor.canvasContext?.node.id

    if (!nodeId) {
      console.warn('CanvasFocusManager: Cannot unregister editor without node ID')
      return
    }

    const removedEditor = this.editors.get(nodeId)
    this.editors.delete(nodeId)

    if (removedEditor === this.focusedEditor) {
      this.focusedEditor = null
    }

    if (removedEditor && this.options.onEditorUnregistered) {
      this.options.onEditorUnregistered(removedEditor)
    }
  }

  /**
   * Set the focused editor
   */
  setFocusedEditor(editor: Editor | string | null): void {
    const previousEditor = this.focusedEditor

    if (editor === null) {
      this.focusedEditor = null
      if (this.options.onFocusChange) {
        this.options.onFocusChange(null, previousEditor)
      }
      return
    }

    const nodeId = typeof editor === 'string' ? editor : editor.canvasContext?.node.id
    if (!nodeId) {
      console.warn('CanvasFocusManager: Cannot focus editor without node ID')
      return
    }

    const targetEditor = typeof editor === 'string' ? this.editors.get(editor) : editor

    if (!targetEditor) {
      console.warn(`CanvasFocusManager: Editor with ID ${nodeId} not found`)
      return
    }

    // Blur other editors if exclusive focus is enabled
    if (this.options.exclusiveFocus) {
      this.editors.forEach(ed => {
        if (ed !== targetEditor && ed.isFocused) {
          // @ts-ignore - blur command is dynamically added
          ed.commands.blur()
        }
      })
    }

    this.focusedEditor = targetEditor

    // Focus the target editor if not already focused
    if (!targetEditor.isFocused) {
      // @ts-ignore - focus command is dynamically added
      targetEditor.commands.focus()
    }

    if (this.options.onFocusChange) {
      this.options.onFocusChange(targetEditor, previousEditor)
    }
  }

  /**
   * Get the currently focused editor
   */
  getFocusedEditor(): Editor | null {
    return this.focusedEditor
  }

  /**
   * Get an editor by its canvas node ID
   */
  getEditor(nodeId: string): Editor | undefined {
    return this.editors.get(nodeId)
  }

  /**
   * Get all registered editors
   */
  getAllEditors(): Editor[] {
    return Array.from(this.editors.values())
  }

  /**
   * Get visible editors (within canvas viewport)
   */
  getVisibleEditors(): Editor[] {
    return Array.from(this.editors.values()).filter(editor => {
      return editor.canvasContext?.isVisible ?? false
    })
  }

  /**
   * Focus the next editor in the list
   */
  focusNext(): void {
    const editors = this.getAllEditors()
    if (editors.length === 0) {return}

    const currentIndex = this.focusedEditor ? editors.findIndex(ed => ed === this.focusedEditor) : -1

    const nextIndex = (currentIndex + 1) % editors.length
    this.setFocusedEditor(editors[nextIndex])
  }

  /**
   * Focus the previous editor in the list
   */
  focusPrevious(): void {
    const editors = this.getAllEditors()
    if (editors.length === 0) {return}

    const currentIndex = this.focusedEditor ? editors.findIndex(ed => ed === this.focusedEditor) : -1

    const previousIndex = currentIndex <= 0 ? editors.length - 1 : currentIndex - 1
    this.setFocusedEditor(editors[previousIndex])
  }

  /**
   * Blur all editors
   */
  blurAll(): void {
    this.editors.forEach(editor => {
      if (editor.isFocused) {
        // @ts-ignore - blur command is dynamically added
        editor.commands.blur()
      }
    })
    this.focusedEditor = null
  }

  /**
   * Destroy the focus manager and clean up
   */
  destroy(): void {
    this.editors.clear()
    this.focusedEditor = null
  }
}

/**
 * Create a canvas focus manager with default options
 */
export function createCanvasFocusManager(options?: FocusManagerOptions): CanvasFocusManager {
  return new CanvasFocusManager(options)
}
