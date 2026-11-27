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
import { ReplaceStep } from 'prosemirror-transform'
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
import { mergeNextYText } from '../conversion/mergeNextYText.js'
import { updateYFragment } from '../reconciliation/updateYFragment.js'
import { deleteMapping } from './deleteMapping.js'
import { projectedMappings } from './projectedMappings.js'
import { replaceChangedChildren } from './replaceChangedChildren.js'

// Remote changes wait at most this long while a composition is running.
const maxCompositionDelay = 1000

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
  readonly reportInvalidContent?: (error: Error) => void
  readonly deferTextMerge?: (text: Y.XmlText) => void
  private readonly onInvalidContent?: (error: Error) => void
  private _invalidContentError: Error | null = null
  private projectionError: Error | null = null
  private hasSharedContent = false
  private pendingTextMerges: Y.XmlText[] = []
  private hasPendingRemoteChanges = false
  private pendingRemoteTransactions: Y.Transaction[] = []
  private pendingRemoteSelection: RelativeSelection | null = null
  private pendingRemoteBaseDoc: PModel.Node | null = null

  constructor(
    yXmlFragment: Y.XmlFragment,
    mapping: ProsemirrorMapping = new Map(),
    onInvalidContent?: (error: Error) => void,
  ) {
    this.type = yXmlFragment
    this.mapping = mapping
    this._observeFunction = this._typeChanged.bind(this)

    if (onInvalidContent) {
      this.onInvalidContent = onInvalidContent
      this.reportInvalidContent = error => {
        this.projectionError ??= error
      }
      this.deferTextMerge = text => {
        this.pendingTextMerges.push(text)
      }
    }

    if (yXmlFragment.doc === null) {
      throw new Error('The Yjs fragment must belong to a document')
    }

    this.doc = yXmlFragment.doc
    // Capture against the old mapping before Yjs observers rebuild the editor document.
    this.beforeAllTransactions = () => {
      if (
        this._invalidContentError === null &&
        this.beforeTransactionSelection === null &&
        this.prosemirrorView != null
      ) {
        this.beforeTransactionSelection = getRelativeSelection(this, this.view.state)
      }
    }
    this.afterAllTransactions = () => {
      this.beforeTransactionSelection = null
    }
  }

  /**
   * Returns the schema error that pauses editing and shared writes.
   * Only set when the binding keeps invalid content.
   * @returns The error, or null when the shared content fits the editor schema.
   */
  get invalidContentError(): Error | null {
    return this._invalidContentError
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

  private createDocumentContent(): PModel.Fragment {
    this.projectionError = null
    this.pendingTextMerges = []

    const fragmentContent = this.type
      .toArray()
      .map(type => {
        if (!(type instanceof Y.XmlElement)) {
          throw error.methodUnimplemented()
        }

        return createNodeFromYElement(type, this.view.state.schema, this)
      })
      .filter(node => node !== null)
    const content = PModel.Fragment.from(fragmentContent)
    const { topNodeType } = this.view.state.schema

    this.hasSharedContent ||= this.type.length > 0
    // Only a fragment that never had content uses the editor's placeholder document
    const isPlaceholder = content.childCount === 0 && !this.hasSharedContent

    if (this.reportInvalidContent && !isPlaceholder && !topNodeType.validContent(content)) {
      this.reportInvalidContent(new RangeError('Shared content does not fit the document schema'))
    }

    // Keep shared text unchanged while content is invalid
    if (this.projectionError === null) this.pendingTextMerges.forEach(mergeNextYText)

    return content
  }

  /** Returns the projection error only when the content just stopped fitting the schema. */
  private updateInvalidContentError(): Error | null {
    const error = this.projectionError
    const isNewError = error !== null && this._invalidContentError === null

    this._invalidContentError = error

    return isNewError ? error : null
  }

  private notifyInvalidContent(error: Error | null) {
    if (error) this.onInvalidContent?.(error)
  }

  private createDocumentTransaction(): Transaction {
    const content = this.createDocumentContent()

    return this._tr.replace(0, this.view.state.doc.content.size, new PModel.Slice(content, 0, 0))
  }

  unrenderSnapshot() {
    this.mapping.clear()
    projectedMappings.delete(this.mapping)
    let newError: Error | null = null

    this.mux(() => {
      const tr = this.createDocumentTransaction()

      newError = this.updateInvalidContentError()
      tr.setMeta(ySyncPluginKey, { snapshot: null, prevSnapshot: null })
      this.view.dispatch(tr)
    })

    this.notifyInvalidContent(newError)
  }

  _forceRerender() {
    this.mapping.clear()
    projectedMappings.delete(this.mapping)
    let newError: Error | null = null

    this.mux(() => {
      const sel = this.beforeTransactionSelection !== null ? null : this.view.state.selection
      const tr = this.createDocumentTransaction()

      newError = this.updateInvalidContentError()

      if (sel) {
        const clampedAnchor = math.min(math.max(sel.anchor, 0), tr.doc.content.size)
        const clampedHead = math.min(math.max(sel.head, 0), tr.doc.content.size)

        tr.setSelection(TextSelection.create(tr.doc, clampedAnchor, clampedHead))
      }

      this.view.dispatch(tr.setMeta(ySyncPluginKey, { isChangeOrigin: true, binding: this }))
    })

    this.notifyInvalidContent(newError)
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
                {
                  mapping: new Map(),
                  isOMark: new Map(),
                  // Never change shared content while showing a snapshot
                  reportInvalidContent: this.reportInvalidContent ? () => {} : undefined,
                  deferTextMerge: this.reportInvalidContent ? () => {} : undefined,
                },
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

    // Hold remote changes while a composition runs, so the browser keeps its composition node.
    if (this.view.composing) {
      this.deferRemoteChange(transaction)

      return
    }

    this.clearPendingRemoteChanges()

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
    let newError: Error | null = null

    this.mux(() => {
      this.clearDeletedMappings(transaction)

      let tr = replaceChangedChildren(this._tr, this.createDocumentContent())

      newError = this.updateInvalidContentError()

      // Skipped content has no place in the editor to restore the selection to
      if (this._invalidContentError === null) restoreRelativeSelection(tr, selection, this, oldDoc)
      tr = tr.setMeta(ySyncPluginKey, {
        isChangeOrigin: true,
        isUndoRedoOperation,
      })

      if (this.beforeTransactionSelection !== null && this._isLocalCursorInView()) {
        tr.scrollIntoView()
      }

      this.view.dispatch(tr)
    })

    this.notifyInvalidContent(newError)
  }

  /** Hold a remote change until the running composition ends. */
  private deferRemoteChange(transaction: Y.Transaction) {
    if (!this.hasPendingRemoteChanges) {
      this.hasPendingRemoteChanges = true
      this.pendingRemoteSelection = this.beforeTransactionSelection
      this.pendingRemoteBaseDoc = this.view.state.doc
      eventloop.timeout(maxCompositionDelay, () => this.flushPendingRemoteChanges(true))
    }

    this.pendingRemoteTransactions.push(transaction)
  }

  /** Drop held remote changes after they were rendered another way. */
  private clearPendingRemoteChanges() {
    if (!this.hasPendingRemoteChanges) {
      return
    }

    this.hasPendingRemoteChanges = false
    this.pendingRemoteTransactions.forEach(transaction => this.clearDeletedMappings(transaction))
    this.pendingRemoteTransactions = []
    this.pendingRemoteSelection = null
    this.pendingRemoteBaseDoc = null
  }

  private clearDeletedMappings(transaction: Y.Transaction) {
    const delType = (_: unknown, type: unknown) => deleteMapping(this.mapping, type)

    Y.iterateDeletedStructs(transaction, transaction.deleteSet, struct => {
      if (struct instanceof Y.Item && struct.content instanceof Y.ContentType) {
        deleteMapping(this.mapping, struct.content.type)
      }
    })
    transaction.changed.forEach(delType)
    transaction.changedParentTypes.forEach(delType)
  }

  // Whether held remote changes can be rendered now.
  private canFlushPendingRemoteChanges(force: boolean): boolean {
    if (!this.hasPendingRemoteChanges || this.prosemirrorView == null) {
      return false
    }

    if (!force && this.view.composing) {
      return false
    }

    const syncState = getSyncPluginState(this.view.state)

    return syncState.snapshot == null && syncState.prevSnapshot == null
  }

  // Take held remote changes out of the binding so they render exactly once.
  private takePendingRemoteChanges() {
    const pending = {
      transactions: this.pendingRemoteTransactions,
      selection: this.pendingRemoteSelection,
      baseDoc: this.pendingRemoteBaseDoc,
    }
    this.hasPendingRemoteChanges = false
    this.pendingRemoteTransactions = []
    this.pendingRemoteSelection = null
    this.pendingRemoteBaseDoc = null

    return pending
  }

  // Build the transaction rendering held remote changes, merging them with
  // local edits made while composing when possible.
  private buildPendingRemoteTransaction(
    baseDoc: PModel.Node | null,
    remoteContent: PModel.Fragment,
  ) {
    const mergedTr =
      baseDoc == null || this.projectionError !== null
        ? null
        : this.mergeHeldRemoteChanges(baseDoc, this.view.state.doc, remoteContent)

    return {
      tr: mergedTr ?? replaceChangedChildren(this._tr, remoteContent),
      merged: mergedTr != null,
    }
  }

  // Render held remote changes into the editor.
  flushPendingRemoteChanges(force = false): boolean {
    if (!this.canFlushPendingRemoteChanges(force)) {
      return false
    }

    const pending = this.takePendingRemoteChanges()
    pending.transactions.forEach(transaction => this.clearDeletedMappings(transaction))

    const remoteContent = this.createDocumentContent()
    const { tr, merged } = this.buildPendingRemoteTransaction(pending.baseDoc, remoteContent)
    const newError = this.dispatchPendingRemoteChanges(pending.transactions, pending.selection, tr)

    // The flush dispatch runs inside the mutex, so the plugin's own sync call
    // for it is dropped. Sync the merged text to the shared document here.
    if (merged) {
      this._prosemirrorChanged(this.view.state.doc)
    }

    this.notifyInvalidContent(newError)

    return true
  }

  // Dispatch a transaction rendering held remote changes.
  private dispatchPendingRemoteChanges(
    transactions: Y.Transaction[],
    selection: RelativeSelection | null,
    tr: Transaction,
  ): Error | null {
    let newError: Error | null = null

    this.mux(() => {
      newError = this.updateInvalidContentError()

      // Skipped content has no place in the editor to restore the selection to
      if (this._invalidContentError === null) {
        restoreRelativeSelection(tr, selection, this, this.view.state.doc)
      }
      tr.setMeta(ySyncPluginKey, {
        isChangeOrigin: true,
        isUndoRedoOperation: transactions.some(
          transaction => transaction.origin instanceof Y.UndoManager,
        ),
      })

      if (selection !== null && this._isLocalCursorInView()) {
        tr.scrollIntoView()
      }

      this.view.dispatch(tr)
    })

    return newError
  }

  /** Render held remote changes once the running composition ends. */
  schedulePendingFlush() {
    if (this.prosemirrorView == null || !this.hasPendingRemoteChanges || this.view.composing) {
      return
    }

    eventloop.timeout(0, () => this.flushPendingRemoteChanges())
  }

  // One replace step turning one document into another, or null when identical.
  private diffStep(fromDoc: PModel.Node, toDoc: PModel.Node): ReplaceStep | null {
    const start = fromDoc.content.findDiffStart(toDoc.content)

    if (start == null) {
      return null
    }

    const end = fromDoc.content.findDiffEnd(toDoc.content)

    if (end == null) {
      return null
    }

    return new ReplaceStep(start, end.a, toDoc.slice(start, end.b))
  }

  // Apply held remote changes on top of local edits made while composing.
  // Replacing the paragraph would drop those edits, so the remote change is
  // applied as a step mapped past the local edits instead. Returns null when
  // the two changes overlap and cannot be merged cleanly.
  private mergeHeldRemoteChanges(
    baseDoc: PModel.Node,
    localDoc: PModel.Node,
    remoteContent: PModel.Fragment,
  ): Transaction | null {
    const remoteDoc = this.view.state.schema.topNodeType.create(null, remoteContent)
    const remoteStep = this.diffStep(baseDoc, remoteDoc)

    if (remoteStep == null) {
      return null
    }

    const localStep = this.diffStep(baseDoc, localDoc)

    if (localStep == null) {
      return null
    }

    const mappedRemoteStep = remoteStep.map(localStep.getMap())

    if (mappedRemoteStep == null) {
      return null
    }

    const tr = this._tr

    tr.step(mappedRemoteStep)

    return tr
  }

  _prosemirrorChanged(doc: PModel.Node) {
    if (this._invalidContentError !== null) return

    // Never diff against shared content that holds changes not shown yet
    if (this.hasPendingRemoteChanges) return

    const syncState = getSyncPluginState(this.view.state)
    if (syncState.snapshot != null || syncState.prevSnapshot != null) return

    this.doc.transact(() => {
      updateYFragment(this.doc, this.type, doc, this)
      this.hasSharedContent ||= this.type.length > 0

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
    this.hasPendingRemoteChanges = false
    this.pendingRemoteTransactions = []
    this.pendingRemoteSelection = null
    this.pendingRemoteBaseDoc = null
    this.type.unobserveDeep(this._observeFunction)
    this.doc.off('beforeAllTransactions', this.beforeAllTransactions)
    this.doc.off('afterAllTransactions', this.afterAllTransactions)
  }
}
