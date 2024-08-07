import { Extension } from '@tiptap/core'
import { EditorView } from '@tiptap/pm/view'
import {
  redo,
  undo,
  ySyncPlugin,
  yUndoPlugin,
  yUndoPluginKey,
} from 'y-prosemirror'
import { UndoManager } from 'yjs'

type YSyncOpts = Parameters<typeof ySyncPlugin>[1]

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    collaboration: {
      /**
       * Undo recent changes
       * @example editor.commands.undo()
       */
      undo: () => ReturnType,
      /**
       * Reapply reverted changes
       * @example editor.commands.redo()
       */
      redo: () => ReturnType,
    }
  }
}

export interface CollaborationOptions {
  /**
   * An initialized Y.js document.
   * @example new Y.Doc()
   */
  document: any,

  /**
   * Name of a Y.js fragment, can be changed to sync multiple fields with one Y.js document.
   * @default 'default'
   * @example 'my-custom-field'
   */
  field: string,

  /**
   * A raw Y.js fragment, can be used instead of `document` and `field`.
   * @example new Y.Doc().getXmlFragment('body')
   */
  fragment: any,

  /**
   * Fired when the content from Yjs is initially rendered to Tiptap.
   */
  onFirstRender?: () => void,

  ySyncOptions?: YSyncOpts
}

/**
 * This extension allows you to collaborate with others in real-time.
 * @see https://tiptap.dev/api/extensions/collaboration
 */
export const Collaboration = Extension.create<CollaborationOptions>({
  name: 'collaboration',

  priority: 1000,

  addOptions() {
    return {
      document: null,
      field: 'default',
      fragment: null,
    }
  },

  onCreate() {
    if (this.editor.extensionManager.extensions.find(extension => extension.name === 'history')) {
      console.warn('[tiptap warn]: "@tiptap/extension-collaboration" comes with its own history support and is not compatible with "@tiptap/extension-history".')
    }
  },

  addCommands() {
    return {
      undo: () => ({ tr, state, dispatch }) => {
        tr.setMeta('preventDispatch', true)

        const undoManager: UndoManager = yUndoPluginKey.getState(state).undoManager

        if (undoManager.undoStack.length === 0) {
          return false
        }

        if (!dispatch) {
          return true
        }

        return undo(state)
      },
      redo: () => ({ tr, state, dispatch }) => {
        tr.setMeta('preventDispatch', true)

        const undoManager: UndoManager = yUndoPluginKey.getState(state).undoManager

        if (undoManager.redoStack.length === 0) {
          return false
        }

        if (!dispatch) {
          return true
        }

        return redo(state)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-z': () => this.editor.commands.undo(),
      'Mod-y': () => this.editor.commands.redo(),
      'Shift-Mod-z': () => this.editor.commands.redo(),
    }
  },

  addProseMirrorPlugins() {
    const fragment = this.options.fragment
      ? this.options.fragment
      : this.options.document.getXmlFragment(this.options.field)

    // Quick fix until there is an official implementation (thanks to @hamflx).
    // See https://github.com/yjs/y-prosemirror/issues/114 and https://github.com/yjs/y-prosemirror/issues/102
    const yUndoPluginInstance = yUndoPlugin()
    const originalUndoPluginView = yUndoPluginInstance.spec.view

    yUndoPluginInstance.spec.view = (view: EditorView) => {
      const { undoManager } = yUndoPluginKey.getState(view.state)

      if (undoManager.restore) {
        undoManager.restore()
        // eslint-disable-next-line
        undoManager.restore = () => {}
      }

      const viewRet = originalUndoPluginView ? originalUndoPluginView(view) : undefined

      return {
        destroy: () => {
          const hasUndoManSelf = undoManager.trackedOrigins.has(undoManager)
          // eslint-disable-next-line
          const observers = undoManager._observers

          undoManager.restore = () => {
            if (hasUndoManSelf) {
              undoManager.trackedOrigins.add(undoManager)
            }

            undoManager.doc.on('afterTransaction', undoManager.afterTransactionHandler)
            // eslint-disable-next-line
            undoManager._observers = observers
          }

          if (viewRet?.destroy) {
            viewRet.destroy()
          }
        },
      }
    }

    const ySyncPluginOptions: YSyncOpts = {
      ...this.options.ySyncOptions,
      onFirstRender: this.options.onFirstRender,
    }

    const ySyncPluginInstance = ySyncPlugin(fragment, ySyncPluginOptions)

    return [ySyncPluginInstance, yUndoPluginInstance]
  },
})
