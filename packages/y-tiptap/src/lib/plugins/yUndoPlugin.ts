import { Plugin } from 'prosemirror-state'
import type { EditorState } from 'prosemirror-state'
import { ContentType, Item, Text, UndoManager, XmlElement } from 'yjs'
import type { Doc } from 'yjs'
import type { UndoPluginOptions } from '../../types/UndoPluginOptions.js'
import type { UndoPluginState } from '../../types/UndoPluginState.js'
import { getSyncPluginState } from './getSyncPluginState.js'
import { getUndoPluginState } from './getUndoPluginState.js'
import { ySyncPluginKey, yUndoPluginKey } from './keys.js'
import { getRelativeSelection } from '../utils/positions/getRelativeSelection.js'
import { restorePositionHistory } from '../utils/positions/migrations/restorePositionHistory.js'

const restoreHistory = (state: EditorState, direction: 'undo' | 'redo') => {
  const syncState = getSyncPluginState(state)
  if (
    syncState.binding.projectionError !== null ||
    syncState.snapshot != null ||
    syncState.prevSnapshot != null
  )
    return false

  const undoManager = getUndoPluginState(state).undoManager

  if (undoManager != null) {
    restorePositionHistory(syncState.type, undoManager, direction)

    return true
  }
}

/** Undoes a local change through the editor's Yjs undo manager. */
export const undo = (state: EditorState) => restoreHistory(state, 'undo')

/** Redoes a local change through the editor's Yjs undo manager. */
export const redo = (state: EditorState) => restoreHistory(state, 'redo')

export const defaultProtectedNodes = new Set(['paragraph'])

/** Keeps protected structural nodes when an undo operation would delete them. */
export const defaultDeleteFilter = (item: unknown, protectedNodes: Set<string>) =>
  !(item instanceof Item) ||
  !(item.content instanceof ContentType) ||
  !(
    item.content.type instanceof Text ||
    (item.content.type instanceof XmlElement && protectedNodes.has(item.content.type.nodeName))
  ) ||
  item.content.type._length === 0

/** Tracks local Yjs changes for undo and redo while preserving remote changes. */
export const yUndoPlugin = ({
  protectedNodes = defaultProtectedNodes,
  trackedOrigins = [],
  undoManager = null,
}: UndoPluginOptions = {}): Plugin<UndoPluginState> =>
  new Plugin<UndoPluginState>({
    key: yUndoPluginKey,
    state: {
      init: (_, state) => {
        const syncState = getSyncPluginState(state)
        const destroyListeners = new Set<(document: Doc) => void>()
        let manager = undoManager

        if (!manager) {
          // Yjs leaves its document listener attached after destroying the manager.
          const before = new Set(syncState.doc._observers.get('destroy'))

          manager = new UndoManager(syncState.type, {
            trackedOrigins: new Set([ySyncPluginKey, ...trackedOrigins]),
            deleteFilter: item => defaultDeleteFilter(item, protectedNodes),
            captureTransaction: transaction => transaction.meta.get('addToHistory') !== false,
          })

          const after: Set<(document: Doc) => void> =
            syncState.doc._observers.get('destroy') ?? new Set()

          after.forEach(listener => {
            if (!before.has(listener)) {
              destroyListeners.add(listener)
            }
          })
        }

        return {
          undoManager: manager,
          prevSel: null,
          hasUndoOps: manager.undoStack.length > 0,
          hasRedoOps: manager.redoStack.length > 0,
          destroyListeners,
        }
      },
      apply: (_, value, oldState, state) => {
        const binding = getSyncPluginState(state).binding

        return {
          ...value,
          prevSel: binding ? getRelativeSelection(binding, oldState) : value.prevSel,
          hasUndoOps: value.undoManager.undoStack.length > 0,
          hasRedoOps: value.undoManager.redoStack.length > 0,
        }
      },
    },
    view: view => {
      const syncState = getSyncPluginState(view.state)
      const { undoManager: manager, destroyListeners } = getUndoPluginState(view.state)

      manager.on('stack-item-added', ({ stackItem }) => {
        const binding = syncState.binding

        if (binding) {
          stackItem.meta.set(binding, getUndoPluginState(view.state).prevSel)
        }
      })
      manager.on('stack-item-popped', ({ stackItem }) => {
        const binding = syncState.binding

        if (binding) {
          binding.beforeTransactionSelection =
            stackItem.meta.get(binding) || binding.beforeTransactionSelection
        }
      })

      return {
        destroy: () => {
          manager.destroy()
          destroyListeners.forEach(listener => manager.doc.off('destroy', listener))
          destroyListeners.clear()
        },
      }
    },
  })
