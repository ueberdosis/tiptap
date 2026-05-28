import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { redo, undo, ySyncPlugin, yUndoPlugin, yUndoPluginKey } from '@tiptap/y-tiptap'
import type { Doc, UndoManager, XmlFragment } from 'yjs'

import {
  createMappablePosition,
  getUpdatedPosition,
} from './helpers/CollaborationMappablePosition.js'
import { isChangeOrigin } from './helpers/isChangeOrigin.js'
import {
  getCollabMigrationCapabilities,
  syncMigrationCapabilitiesToAwareness,
  type CollabMigrationCapabilities,
} from './helpers/migrationCapabilities.js'
import { syncDocumentVersionWithYdoc } from './helpers/syncDocumentVersion.js'

type YSyncOpts = Parameters<typeof ySyncPlugin>[1]
type YUndoOpts = Parameters<typeof yUndoPlugin>[0]

export interface CollaborationStorage {
  /**
   * Whether collaboration is currently disabled.
   * Disabling collaboration will prevent any changes from being synced with other users.
   */
  isDisabled: boolean
  /**
   * Unsubscribes document version sync with the Yjs document.
   */
  unsubscribeDocumentVersion?: () => void
  /**
   * Migration capabilities last published to provider awareness.
   */
  migrationCapabilities?: CollabMigrationCapabilities
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    collaboration: {
      /**
       * Undo recent changes
       * @example editor.commands.undo()
       */
      undo: () => ReturnType
      /**
       * Reapply reverted changes
       * @example editor.commands.redo()
       */
      redo: () => ReturnType
    }
  }

  interface Storage {
    collaboration: CollaborationStorage
  }
}

export interface CollaborationOptions {
  /**
   * An initialized Y.js document.
   * @example new Y.Doc()
   */
  document?: Doc | null

  /**
   * Name of a Y.js fragment, can be changed to sync multiple fields with one Y.js document.
   * @default 'default'
   * @example 'my-custom-field'
   */
  field?: string

  /**
   * A raw Y.js fragment, can be used instead of `document` and `field`.
   * @example new Y.Doc().getXmlFragment('body')
   */
  fragment?: XmlFragment | null

  /**
   * The collaboration provider.
   * @default null
   */
  provider?: any | null

  /**
   * Fired when the content from Yjs is initially rendered to Tiptap.
   */
  onFirstRender?: () => void

  /**
   * Options for the Yjs sync plugin.
   */
  ySyncOptions?: YSyncOpts

  /**
   * Options for the Yjs undo plugin.
   */
  yUndoOptions?: YUndoOpts

  /**
   * Sync `documentVersion` with the Yjs document map under the `tiptap` key.
   * @default true
   */
  syncDocumentVersion?: boolean

  /**
   * Publish {@link CollabMigrationCapabilities} on `provider.awareness` for servers to validate sessions.
   * @default true
   */
  syncMigrationCapabilities?: boolean
}

/**
 * This extension allows you to collaborate with others in real-time.
 * @see https://tiptap.dev/api/extensions/collaboration
 */
export const Collaboration = Extension.create<CollaborationOptions, CollaborationStorage>({
  name: 'collaboration',

  priority: 1000,

  addOptions() {
    return {
      document: null,
      field: 'default',
      fragment: null,
      provider: null,
    }
  },

  addStorage() {
    return {
      isDisabled: false,
    }
  },

  onCreate() {
    if (this.editor.extensionManager.extensions.find(extension => extension.name === 'undoRedo')) {
      console.warn(
        '[tiptap warn]: "@tiptap/extension-collaboration" comes with its own history support and is not compatible with "@tiptap/extension-undo-redo".',
      )
    }

    if (this.options.syncMigrationCapabilities !== false && this.options.provider?.awareness) {
      const capabilities = getCollabMigrationCapabilities(this.editor.options.migrations)

      this.storage.migrationCapabilities = capabilities
      syncMigrationCapabilitiesToAwareness(this.options.provider, capabilities)
    }
  },

  onDestroy() {
    this.storage.unsubscribeDocumentVersion?.()
  },

  onBeforeCreate() {
    if (this.options.syncDocumentVersion !== false && this.options.document) {
      this.storage.unsubscribeDocumentVersion = syncDocumentVersionWithYdoc(
        this.editor,
        this.options.document,
      )
    }

    this.editor.utils.getUpdatedPosition = (position, transaction) =>
      getUpdatedPosition(position, transaction, this.editor.state)
    this.editor.utils.createMappablePosition = position =>
      createMappablePosition(position, this.editor.state)
  },

  addCommands() {
    return {
      undo:
        () =>
        ({ tr, state, dispatch }) => {
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
      redo:
        () =>
        ({ tr, state, dispatch }) => {
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
      : (this.options.document as Doc).getXmlFragment(this.options.field)

    // Quick fix until there is an official implementation (thanks to @hamflx).
    // See https://github.com/yjs/y-prosemirror/issues/114 and https://github.com/yjs/y-prosemirror/issues/102
    const yUndoPluginInstance = yUndoPlugin(this.options.yUndoOptions)
    const originalUndoPluginView = yUndoPluginInstance.spec.view

    yUndoPluginInstance.spec.view = (view: EditorView) => {
      const { undoManager } = yUndoPluginKey.getState(view.state)

      if (undoManager.restore) {
        undoManager.restore()
        undoManager.restore = () => {
          // noop
        }
      }

      const viewRet = originalUndoPluginView ? originalUndoPluginView(view) : undefined

      return {
        destroy: () => {
          const hasUndoManSelf = undoManager.trackedOrigins.has(undoManager)
          // oxlint-disable-next-line no-underscore-dangle
          const observers = undoManager._observers

          undoManager.restore = () => {
            if (hasUndoManSelf) {
              undoManager.trackedOrigins.add(undoManager)
            }

            undoManager.doc.on('afterTransaction', undoManager.afterTransactionHandler)
            // oxlint-disable-next-line no-underscore-dangle
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

    return [
      ySyncPluginInstance,
      yUndoPluginInstance,
      // Only add the filterInvalidContent plugin if content checking is enabled
      this.editor.options.enableContentCheck &&
        new Plugin({
          key: new PluginKey('filterInvalidContent'),
          filterTransaction: transaction => {
            if (!isChangeOrigin(transaction)) {
              return true
            }
            if (this.storage.isDisabled) {
              return false
            }
            if (!transaction.docChanged) {
              return true
            }
            try {
              transaction.doc.check()
              return true
            } catch (error) {
              this.storage.isDisabled = true
              this.editor.emit('contentError', {
                error: error as Error,
                editor: this.editor,
                disableCollaboration: () => {
                  fragment.doc?.destroy()
                },
              })
              return false
            }
          },
        }),
    ].filter(Boolean)
  },
})
