import { getSyncPluginState } from './getSyncPluginState.js'
import type { ColorDef } from '../../types/ColorDef.js'
import type { SyncPluginOptions } from '../../types/SyncPluginOptions.js'
import type { SyncPluginState } from '../../types/SyncPluginState.js'
import { Plugin } from 'prosemirror-state'
import { ySyncPluginKey, yUndoPluginKey } from './keys.js'
import * as Y from 'yjs'
import * as eventloop from 'lib0/eventloop'
import { ProsemirrorBinding } from '../utils/binding/ProsemirrorBinding.js'
import { clearPositionMigrations } from '../utils/positions/clearPositionMigrations.js'

const defaultColors: ColorDef[] = [{ light: '#ecd44433', dark: '#ecd444' }]
/** Binds a Yjs XML fragment to the editor document. The fragment must belong to a Yjs document. */
export const ySyncPlugin = (
  yXmlFragment: Y.XmlFragment,
  {
    colors = defaultColors,
    colorMapping = new Map(),
    permanentUserData = null,
    onFirstRender = () => {},
    mapping,
    onInvalidContent,
  }: SyncPluginOptions = {},
) => {
  let initialContentChanged = false
  const binding = new ProsemirrorBinding(yXmlFragment, mapping, onInvalidContent)
  const plugin = new Plugin<SyncPluginState>({
    // Keep local changes out while the editor cannot show all shared content
    filterTransaction: transaction =>
      binding.invalidContentError === null ||
      !transaction.docChanged ||
      transaction.getMeta(ySyncPluginKey) !== undefined,
    props: {
      editable: state => {
        const syncState = getSyncPluginState(state)

        return (
          binding.invalidContentError === null &&
          syncState.snapshot == null &&
          syncState.prevSnapshot == null
        )
      },
    },
    key: ySyncPluginKey,
    state: {
      init: (_initargs, _state) => {
        return {
          type: yXmlFragment,
          doc: binding.doc,
          binding,
          snapshot: null,
          prevSnapshot: null,
          isChangeOrigin: false,
          isUndoRedoOperation: false,
          addToHistory: true,
          colors,
          colorMapping,
          permanentUserData,
        }
      },
      apply: (tr, pluginState) => {
        const change: Partial<SyncPluginState> | undefined = tr.getMeta(ySyncPluginKey)

        if (change !== undefined) {
          pluginState = Object.assign({}, pluginState, change)
        }

        if (tr.docChanged) {
          pluginState.addToHistory = tr.getMeta('addToHistory') !== false
        }

        pluginState.isChangeOrigin = change !== undefined && !!change.isChangeOrigin
        pluginState.isUndoRedoOperation =
          change !== undefined && !!change.isChangeOrigin && !!change.isUndoRedoOperation

        if (
          binding.prosemirrorView === null ||
          change === undefined ||
          (change.snapshot == null && change.prevSnapshot == null)
        ) {
          return pluginState
        }

        eventloop.timeout(0, () => {
          if (binding.prosemirrorView == null) {
            return
          }

          if (change.restore == null) {
            binding._renderSnapshot(change.snapshot, change.prevSnapshot, pluginState)
            return
          }

          // A restore cannot be saved while shared content is invalid
          if (binding.invalidContentError !== null) {
            binding.unrenderSnapshot()
            return
          }

          binding._renderSnapshot(change.snapshot, change.snapshot, pluginState)
          binding.mux(() => {
            const activeView = binding.prosemirrorView

            if (!activeView) {
              return
            }

            activeView.dispatch(
              binding._tr.setMeta(ySyncPluginKey, {
                restore: false,
                snapshot: null,
                prevSnapshot: null,
                isChangeOrigin: true,
              }),
            )
            binding._prosemirrorChanged(activeView.state.doc)
          })
        })

        return pluginState
      },
    },
    view: view => {
      const clearMigrations = (transaction: Y.Transaction) =>
        clearPositionMigrations(binding.doc, transaction)
      clearPositionMigrations(binding.doc)
      binding.doc.on('afterTransaction', clearMigrations)
      binding.initView(view)

      if (mapping == null) {
        binding._forceRerender()
      }

      onFirstRender()

      return {
        update: () => {
          const pluginState = getSyncPluginState(view.state)

          if (pluginState.snapshot == null && pluginState.prevSnapshot == null) {
            const emptyDocument = view.state.doc.type.createAndFill()

            if (!emptyDocument) {
              throw new Error('The schema cannot create an empty document')
            }

            // Avoid writing the schema's placeholder document before shared content arrives.
            if (
              initialContentChanged ||
              view.state.doc.content.findDiffStart(emptyDocument.content) !== null
            ) {
              initialContentChanged = true

              if (pluginState.addToHistory === false && !pluginState.isChangeOrigin) {
                const yUndoPluginState = yUndoPluginKey.getState(view.state)
                const um = yUndoPluginState && yUndoPluginState.undoManager

                if (um) {
                  um.stopCapturing()
                }
              }

              binding.mux(() => {
                pluginState.doc.transact(tr => {
                  tr.meta.set('addToHistory', pluginState.addToHistory)
                  binding._prosemirrorChanged(view.state.doc)
                }, ySyncPluginKey)
              })
            }
          }
        },
        destroy: () => {
          binding.doc.off('afterTransaction', clearMigrations)
          binding.destroy()
        },
      }
    },
  })

  return plugin
}
