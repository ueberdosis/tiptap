import { getSyncPluginState } from './getSyncPluginState.js'
import type { ColorDef } from '../../types/ColorDef.js'
import type { SyncPluginOptions } from '../../types/SyncPluginOptions.js'
import type { SyncPluginState } from '../../types/SyncPluginState.js'
import { Plugin } from 'prosemirror-state'
import { ySyncPluginKey, yUndoPluginKey } from './keys.js'
import * as Y from 'yjs'
import * as eventloop from 'lib0/eventloop'
import { ProsemirrorBinding } from '../utils/binding/ProsemirrorBinding.js'
import { mapPositionMigration } from '../utils/positions/migrations/mapPositionMigration.js'

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
  const plugin = new Plugin<SyncPluginState>({
    filterTransaction: transaction => binding.projectionError === null || !transaction.docChanged,
    props: {
      editable: state => {
        const syncState = getSyncPluginState(state)

        return (
          binding.projectionError === null &&
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
          positionMigration: null,
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

        // Only local edits need transfers. Remote updates already carry their migration history.
        pluginState = {
          ...pluginState,
          positionMigration:
            binding.projectionError ||
            pluginState.isChangeOrigin ||
            pluginState.snapshot ||
            pluginState.prevSnapshot ||
            change?.snapshot !== undefined ||
            change?.prevSnapshot !== undefined
              ? null
              : mapPositionMigration(tr, binding, pluginState.positionMigration ?? null),
        }

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
          if (binding.projectionError !== null) return

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
      binding.initView(view)

      if (mapping == null) {
        binding._forceRerender()
      }

      onFirstRender()

      return {
        update: () => {
          const pluginState = getSyncPluginState(view.state)

          if (binding.projectionError !== null) return

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
                  binding._prosemirrorChanged(view.state.doc, pluginState.positionMigration ?? null)
                }, ySyncPluginKey)
              })
            }
          }
        },
        destroy: () => {
          binding.destroy()
        },
      }
    },
  })

  return plugin
}
