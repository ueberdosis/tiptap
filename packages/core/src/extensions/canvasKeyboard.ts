import type { Editor } from '../Editor.js'
import { Extension } from '../Extension.js'
import type { CanvasMode } from '../types/canvas.js'

export interface CanvasKeyboardOptions {
  /**
   * Whether canvas keyboard shortcuts are enabled
   * @default true
   */
  enabled: boolean

  /**
   * Whether to enable spatial navigation (arrow keys to move between editors)
   * @default true
   */
  enableSpatialNavigation: boolean

  /**
   * Whether to enable canvas mode shortcuts
   * @default true
   */
  enableModeShortcuts: boolean

  /**
   * Custom keyboard shortcuts
   */
  shortcuts?: Record<string, (editor: Editor) => boolean>

  /**
   * Callback when spatial navigation occurs
   */
  onSpatialNavigate?: (direction: 'up' | 'down' | 'left' | 'right', editor: Editor) => Editor | null

  /**
   * Callback when canvas mode changes via keyboard
   */
  onModeChange?: (mode: CanvasMode, previousMode: CanvasMode) => void
}

export const CanvasKeyboard = Extension.create<CanvasKeyboardOptions>({
  name: 'canvasKeyboard',

  addOptions() {
    return {
      enabled: true,
      enableSpatialNavigation: true,
      enableModeShortcuts: true,
      shortcuts: {},
      onSpatialNavigate: undefined,
      onModeChange: undefined,
    }
  },

  addCommands() {
    return {
      /**
       * Navigate to an editor in a specific direction
       */
      navigateToEditor:
        (direction: 'up' | 'down' | 'left' | 'right') =>
        ({ editor }) => {
          if (!this.options.enabled || !this.options.enableSpatialNavigation) {
            return false
          }

          if (!this.options.onSpatialNavigate) {
            console.warn('CanvasKeyboard: onSpatialNavigate callback is required for spatial navigation')
            return false
          }

          const targetEditor = this.options.onSpatialNavigate(direction, editor)

          if (targetEditor) {
            // @ts-ignore - focus command is dynamically added
            targetEditor.commands.focus()
            return true
          }

          return false
        },

      /**
       * Toggle canvas mode between edit and readonly
       */
      toggleCanvasEditMode:
        () =>
        ({ editor }) => {
          if (!this.options.enabled || !this.options.enableModeShortcuts) {
            return false
          }

          const canvasContext = editor.canvasContext
          if (!canvasContext) {return false}

          const currentMode = canvasContext.mode
          const newMode = currentMode === 'edit' ? 'readonly' : 'edit'

          const previousMode = currentMode
          editor.updateCanvasMode(newMode)

          if (this.options.onModeChange) {
            this.options.onModeChange(newMode, previousMode)
          }

          return true
        },

      /**
       * Set canvas mode
       */
      setCanvasMode:
        (mode: CanvasMode) =>
        ({ editor }) => {
          if (!this.options.enabled || !this.options.enableModeShortcuts) {
            return false
          }

          const canvasContext = editor.canvasContext
          if (!canvasContext) {return false}

          const previousMode = canvasContext.mode
          editor.updateCanvasMode(mode)

          if (this.options.onModeChange) {
            this.options.onModeChange(mode, previousMode)
          }

          return true
        },
    }
  },

  addKeyboardShortcuts() {
    const shortcuts: Record<string, () => boolean> = {}

    // Add custom shortcuts
    if (this.options.shortcuts) {
      Object.entries(this.options.shortcuts).forEach(([key, handler]) => {
        shortcuts[key] = () => {
          if (!this.options.enabled) {return false}
          return handler(this.editor)
        }
      })
    }

    // Spatial navigation shortcuts (Ctrl+Alt+Arrow)
    if (this.options.enableSpatialNavigation) {
      shortcuts['Ctrl-Alt-ArrowUp'] = () => {
        // @ts-ignore - navigateToEditor command is added by this extension
        return this.editor.commands.navigateToEditor('up')
      }

      shortcuts['Ctrl-Alt-ArrowDown'] = () => {
        // @ts-ignore - navigateToEditor command is added by this extension
        return this.editor.commands.navigateToEditor('down')
      }

      shortcuts['Ctrl-Alt-ArrowLeft'] = () => {
        // @ts-ignore - navigateToEditor command is added by this extension
        return this.editor.commands.navigateToEditor('left')
      }

      shortcuts['Ctrl-Alt-ArrowRight'] = () => {
        // @ts-ignore - navigateToEditor command is added by this extension
        return this.editor.commands.navigateToEditor('right')
      }
    }

    // Canvas mode shortcuts
    if (this.options.enableModeShortcuts) {
      // Ctrl+Shift+E to toggle edit mode
      shortcuts['Ctrl-Shift-e'] = () => {
        // @ts-ignore - toggleCanvasEditMode command is added by this extension
        return this.editor.commands.toggleCanvasEditMode()
      }

      // Ctrl+Shift+R for readonly mode
      shortcuts['Ctrl-Shift-r'] = () => {
        // @ts-ignore - setCanvasMode command is added by this extension
        return this.editor.commands.setCanvasMode('readonly')
      }

      // Ctrl+Shift+P for pan mode
      shortcuts['Ctrl-Shift-p'] = () => {
        // @ts-ignore - setCanvasMode command is added by this extension
        return this.editor.commands.setCanvasMode('pan')
      }

      // Ctrl+Shift+S for select mode
      shortcuts['Ctrl-Shift-s'] = () => {
        // @ts-ignore - setCanvasMode command is added by this extension
        return this.editor.commands.setCanvasMode('select')
      }
    }

    return shortcuts
  },
})

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    canvasKeyboard: {
      /**
       * Navigate to an editor in a specific direction
       */
      navigateToEditor: (direction: 'up' | 'down' | 'left' | 'right') => ReturnType
      /**
       * Toggle canvas mode between edit and readonly
       */
      toggleCanvasEditMode: () => ReturnType
      /**
       * Set canvas mode
       */
      setCanvasMode: (mode: CanvasMode) => ReturnType
    }
  }
}
