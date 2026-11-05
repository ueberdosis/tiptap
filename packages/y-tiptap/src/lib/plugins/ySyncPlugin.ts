import type { Node as PMNode } from 'prosemirror-model'
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
  }: SyncPluginOptions = {},
) => {
  let initialContentChanged = false
  const binding = new ProsemirrorBinding(yXmlFragment, mapping)
  // The document the last view left, while it still matches Yjs
  let detachedDoc: PMNode | null = null
  const forgetDetachedDoc = () => {
    detachedDoc = null
    binding.doc.off('afterTransaction', forgetDetachedDoc)
  }
  const plugin = new Plugin<SyncPluginState>({
    props: {
      editable: state => {
        const syncState = getSyncPluginState(state)

        return syncState.snapshot == null && syncState.prevSnapshot == null
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
      binding.doc.off('afterTransaction', forgetDetachedDoc)
      binding.initView(view)

      // Reconfiguring the state recreates this view on the same document, whose nodes are still mapped
      if (mapping == null && view.state.doc !== detachedDoc) {
        binding._forceRerender()
      }

      detachedDoc = null

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
          detachedDoc = view.state.doc
          binding.doc.on('afterTransaction', forgetDetachedDoc)
        },
      }
    },
  })

  return plugin
}
