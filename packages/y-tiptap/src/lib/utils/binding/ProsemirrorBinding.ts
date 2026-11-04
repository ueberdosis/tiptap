import { getSyncPluginState } from '../../plugins/getSyncPluginState.js'
import type { SyncPluginState } from '../../../types/SyncPluginState.js'
import type { RelativeSelection } from '../../../types/RelativeSelection.js'
import type { ProsemirrorMapping } from '../../../types/ProsemirrorMapping.js'
import type { Transaction } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'
import type { ComputeYChange } from '../../../types/YChange.js'
import { createMutex } from 'lib0/mutex'
import * as PModel from 'prosemirror-model'
import { TextSelection } from 'prosemirror-state'
import * as math from 'lib0/math'
import * as error from 'lib0/error'
import { ySyncPluginKey } from '../../plugins/keys.js'
import * as Y from 'yjs'
import * as environment from 'lib0/environment'
import * as dom from 'lib0/dom'
import * as eventloop from 'lib0/eventloop'
import { isVisible } from './isVisible.js'
import { getUserColor } from './getUserColor.js'
import { restoreRelativeSelection } from '../positions/restoreRelativeSelection.js'
import { getRelativeSelection } from '../positions/getRelativeSelection.js'

import { createNodeFromYElement } from '../conversion/createNodeFromYElement.js'
import { updateYFragment } from '../reconciliation/updateYFragment.js'
import type { PositionMigrationPlan } from '../../../types/PositionMigration.js'
import { applyPositionMigration } from '../positions/migrations/applyPositionMigration.js'
import { getPositionMigrationStore } from '../positions/migrations/getPositionMigrationStore.js'
import { deleteMapping } from './deleteMapping.js'
import { projectedMappings } from './projectedMappings.js'
import { replaceChangedChildren } from './replaceChangedChildren.js'

/** Synchronizes one integrated Yjs XML fragment with a ProseMirror editor view. */
export class ProsemirrorBinding {
  readonly type: Y.XmlFragment
  prosemirrorView: EditorView | null = null
  // Prevent editor and Yjs observers from echoing the same change back to each other.
  readonly mux = createMutex()
  readonly mapping: ProsemirrorMapping
  readonly isOMark = new Map<PModel.MarkType, boolean>()
  readonly doc: Y.Doc
  beforeTransactionSelection: RelativeSelection | null = null
  readonly _observeFunction: Parameters<Y.XmlFragment['observeDeep']>[0]
  readonly beforeAllTransactions: () => void
  readonly afterAllTransactions: () => void
  _domSelectionInView: boolean | null = null
  syncedDoc: PModel.Node | null = null

  constructor(yXmlFragment: Y.XmlFragment, mapping: ProsemirrorMapping = new Map()) {
    this.type = yXmlFragment
    this.mapping = mapping
    this._observeFunction = this._typeChanged.bind(this)

    if (yXmlFragment.doc === null) {
      throw new Error('The Yjs fragment must belong to a document')
    }

    this.doc = yXmlFragment.doc
    // Capture against the old mapping before Yjs observers rebuild the editor document.
    this.beforeAllTransactions = () => {
      if (this.beforeTransactionSelection === null && this.prosemirrorView != null) {
        this.beforeTransactionSelection = getRelativeSelection(this, this.view.state)
      }
    }
    this.afterAllTransactions = () => {
      this.beforeTransactionSelection = null
    }
  }

  private get view(): EditorView {
    if (!this.prosemirrorView) {
      throw new Error('The binding has no editor view')
    }

    return this.prosemirrorView
  }

  get _tr() {
    return this.view.state.tr.setMeta('addToHistory', false)
  }

  _isLocalCursorInView() {
    if (!this.view.hasFocus()) {
      return false
    }

    if (environment.isBrowser && this._domSelectionInView === null) {
      eventloop.timeout(0, () => {
        this._domSelectionInView = null
      })
      this._domSelectionInView = this._isDomSelectionInView()
    }

    return this._domSelectionInView
  }

  _isDomSelectionInView() {
    const root = this.view.root
    const selection =
      'getSelection' in root && typeof root.getSelection === 'function'
        ? root.getSelection()
        : this.view.dom.ownerDocument.getSelection()

    if (selection == null || selection.anchorNode == null || selection.focusNode == null) {
      return false
    }

    const range = this.view.dom.ownerDocument.createRange()

    range.setStart(selection.anchorNode, selection.anchorOffset)
    range.setEnd(selection.focusNode, selection.focusOffset)

    const rects = range.getClientRects()

    if (rects.length === 0) {
      if (range.startContainer && range.collapsed) {
        range.selectNodeContents(range.startContainer)
      }
    }

    const bounding = range.getBoundingClientRect()
    const documentElement = dom.doc.documentElement

    return (
      bounding.bottom >= 0 &&
      bounding.right >= 0 &&
      bounding.left <= (window.innerWidth || documentElement.clientWidth || 0) &&
      bounding.top <= (window.innerHeight || documentElement.clientHeight || 0)
    )
  }

  renderSnapshot(
    snapshot: SyncPluginState['snapshot'],
    prevSnapshot: SyncPluginState['prevSnapshot'],
  ) {
    if (!prevSnapshot) {
      prevSnapshot = Y.createSnapshot(Y.createDeleteSet(), new Map())
    }

    this.view.dispatch(this._tr.setMeta(ySyncPluginKey, { snapshot, prevSnapshot }))
  }

  private createDocumentTransaction(): Transaction {
    const fragmentContent = this.type
      .toArray()
      .map(type => {
        if (!(type instanceof Y.XmlElement)) {
          throw error.methodUnimplemented()
        }

        return createNodeFromYElement(type, this.view.state.schema, this)
      })
      .filter(node => node !== null)

    return this._tr.replace(
      0,
      this.view.state.doc.content.size,
      new PModel.Slice(PModel.Fragment.from(fragmentContent), 0, 0),
    )
  }

  unrenderSnapshot() {
    this.mapping.clear()
    projectedMappings.delete(this.mapping)
    this.mux(() => {
      const tr = this.createDocumentTransaction()

      tr.setMeta(ySyncPluginKey, { snapshot: null, prevSnapshot: null })
      this.view.dispatch(tr)
    })
  }

  _forceRerender() {
    this.mapping.clear()
    projectedMappings.delete(this.mapping)
    this.mux(() => {
      const sel = this.beforeTransactionSelection !== null ? null : this.view.state.selection
      const tr = this.createDocumentTransaction()

      if (sel) {
        const clampedAnchor = math.min(math.max(sel.anchor, 0), tr.doc.content.size)
        const clampedHead = math.min(math.max(sel.head, 0), tr.doc.content.size)

        tr.setSelection(TextSelection.create(tr.doc, clampedAnchor, clampedHead))
      }

      this.view.dispatch(tr.setMeta(ySyncPluginKey, { isChangeOrigin: true, binding: this }))
    })
  }

  _renderSnapshot(
    snapshot: SyncPluginState['snapshot'],
    prevSnapshot: SyncPluginState['prevSnapshot'],
    pluginState: SyncPluginState,
  ) {
    let historyDoc: Y.Doc = this.doc
    let historyType = this.type

    if (!snapshot) {
      snapshot = Y.snapshot(this.doc)
    }

    if (snapshot instanceof Uint8Array || prevSnapshot instanceof Uint8Array) {
      if (!(snapshot instanceof Uint8Array) || !(prevSnapshot instanceof Uint8Array)) {
        throw error.unexpectedCase()
      }

      historyDoc = new Y.Doc({ gc: false })
      Y.applyUpdateV2(historyDoc, prevSnapshot)
      prevSnapshot = Y.snapshot(historyDoc)
      Y.applyUpdateV2(historyDoc, snapshot)
      snapshot = Y.snapshot(historyDoc)

      if (historyType._item === null) {
        const rootKey = Array.from(this.doc.share.keys()).find(key =>
          Object.is(this.doc.share.get(key), historyType),
        )

        historyType = historyDoc.getXmlFragment(rootKey)
      } else {
        const historyStructs = historyDoc.store.clients.get(historyType._item.id.client) ?? []
        const itemIndex = Y.findIndexSS(historyStructs, historyType._item.id.clock)
        const item = historyStructs[itemIndex]

        if (
          !(
            item instanceof Y.Item &&
            item.content instanceof Y.ContentType &&
            item.content.type instanceof Y.XmlFragment
          )
        ) {
          throw error.unexpectedCase()
        }

        historyType = item.content.type
      }
    }

    const currentSnapshot = snapshot
    const previousSnapshot = prevSnapshot ?? Y.emptySnapshot

    this.mapping.clear()
    projectedMappings.delete(this.mapping)
    this.mux(() => {
      historyDoc.transact(transaction => {
        const pud = pluginState.permanentUserData

        if (pud) {
          pud.dss.forEach(ds => {
            Y.iterateDeletedStructs(transaction, ds, _item => {})
          })
        }

        const computeYChange: ComputeYChange = (type, id) => {
          const user = pud
            ? type === 'added'
              ? pud.getUserByClientId(id.client)
              : pud.getUserByDeletedId(id)
            : null

          return {
            user,
            type,
            color: getUserColor(pluginState.colorMapping, pluginState.colors, user),
          }
        }
        const fragmentContent = Y.typeListToArraySnapshot(
          historyType,
          // Include content deleted since the previous snapshot so removals remain visible.
          new Y.Snapshot(previousSnapshot.ds, currentSnapshot.sv),
        )
          .map((t: unknown) => {
            if (!(t instanceof Y.XmlElement) || !t._item) {
              return null
            }

            if (
              !t._item.deleted ||
              isVisible(t._item, currentSnapshot) ||
              isVisible(t._item, previousSnapshot)
            ) {
              return createNodeFromYElement(
                t,
                this.view.state.schema,
                { mapping: new Map(), isOMark: new Map() },
                currentSnapshot,
                previousSnapshot,
                computeYChange,
              )
            } else {
              return null
            }
          })
          .filter(n => n !== null)
        const tr = this._tr.replace(
          0,
          this.view.state.doc.content.size,
          new PModel.Slice(PModel.Fragment.from(fragmentContent), 0, 0),
        )

        this.view.dispatch(tr.setMeta(ySyncPluginKey, { isChangeOrigin: true }))
      }, ySyncPluginKey)
    })
  }

  _typeChanged(
    events: Parameters<Parameters<Y.XmlFragment['observeDeep']>[0]>[0],
    transaction: Y.Transaction,
  ) {
    if (this.prosemirrorView == null) {
      return
    }

    const syncState = getSyncPluginState(this.view.state)

    if (events.length === 0 || syncState.snapshot != null || syncState.prevSnapshot != null) {
      this.renderSnapshot(syncState.snapshot, syncState.prevSnapshot)

      return
    }

    const isUndoRedoOperation = transaction.origin instanceof Y.UndoManager
    const undoSelection: RelativeSelection | undefined = isUndoRedoOperation
      ? transaction.origin.currStackItem?.meta.get(this)
      : undefined
    const selection = undoSelection || this.beforeTransactionSelection
    // Historical absolute positions belong to the saved document.
    const oldDoc = undoSelection ? undefined : this.view.state.doc

    this.mux(() => {
      const delType = (_: unknown, type: unknown) => deleteMapping(this.mapping, type)

      Y.iterateDeletedStructs(transaction, transaction.deleteSet, struct => {
        if (struct instanceof Y.Item && struct.content instanceof Y.ContentType) {
          deleteMapping(this.mapping, struct.content.type)
        }
      })
      transaction.changed.forEach(delType)
      transaction.changedParentTypes.forEach(delType)

      const fragmentContent = this.type
        .toArray()
        .map(t => {
          if (!(t instanceof Y.XmlElement)) {
            throw error.methodUnimplemented()
          }

          return createNodeFromYElement(t, this.view.state.schema, this)
        })
        .filter(n => n !== null)
      let tr = replaceChangedChildren(this._tr, PModel.Fragment.from(fragmentContent))

      restoreRelativeSelection(tr, selection, this, oldDoc)
      tr = tr.setMeta(ySyncPluginKey, {
        isChangeOrigin: true,
        isUndoRedoOperation,
      })

      if (this.beforeTransactionSelection !== null && this._isLocalCursorInView()) {
        tr.scrollIntoView()
      }

      this.view.dispatch(tr)
    })
  }

  _prosemirrorChanged(doc: PModel.Node, plan: PositionMigrationPlan | null = null) {
    const syncState = getSyncPluginState(this.view.state)
    if (syncState.snapshot != null || syncState.prevSnapshot != null) return

    this.doc.transact(() => {
      updateYFragment(this.doc, this.type, doc, this)

      // Publish identity transfers with the content so peers receive both atomically.
      if (plan?.doc === doc && !('transactions' in plan)) {
        applyPositionMigration(this.type, plan, this, getPositionMigrationStore(this.type))
      }

      this.syncedDoc = doc
      this.beforeTransactionSelection = getRelativeSelection(this, this.view.state)
    }, ySyncPluginKey)
  }

  initView(prosemirrorView: EditorView) {
    if (this.prosemirrorView != null) {
      this.destroy()
    }

    this.prosemirrorView = prosemirrorView
    this.doc.on('beforeAllTransactions', this.beforeAllTransactions)
    this.doc.on('afterAllTransactions', this.afterAllTransactions)
    this.type.observeDeep(this._observeFunction)
  }

  destroy() {
    if (this.prosemirrorView == null) {
      return
    }

    this.prosemirrorView = null
    this.type.unobserveDeep(this._observeFunction)
    this.doc.off('beforeAllTransactions', this.beforeAllTransactions)
    this.doc.off('afterAllTransactions', this.afterAllTransactions)
  }
}
