import type { Mark } from '@tiptap/pm/model'
import { Plugin, PluginKey, Selection } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

import { ReactEditorView } from '../ReactEditorView.js'

/**
 * IME input for the React-owned view. The mutation observer is off, so
 * compositions are tracked by events instead: record the replaced range at
 * compositionstart, map it through mid-composition transactions, commit the
 * event data as one transaction at compositionend. Nothing is dispatched in
 * between, because a DOM selection write would cancel Safari's IME.
 * Known limits: Android autocorrect outside the recorded range, and preedit
 * nodes left behind on cancel, are only healed by the next render.
 */

interface CompositionRecord {
  /** Doc range the composition replaces; mapped through transactions. */
  from: number
  to: number
  /** Stored marks captured at compositionstart. */
  marks: readonly Mark[] | null
  /** Data stashed from Safari's `insertFromComposition` beforeinput. */
  pendingData: string | null
}

interface CompositionState {
  record: CompositionRecord | null
}

/**
 * Non-public view internals, verified against prosemirror-view 1.41.9 (see
 * AUDIT.md). This plugin takes over PM's composition bookkeeping.
 */
interface CompositionViewInternals {
  input: {
    composing: boolean
    compositionEndedAt: number
    compositionNode: unknown
    composingTimeout: ReturnType<typeof setTimeout> | number
  }
  domObserver: { flush(): void }
}

const compositionPluginKey = new PluginKey<CompositionState>('reactComposition')

const getRecord = (view: EditorView): CompositionRecord | null =>
  compositionPluginKey.getState(view.state)?.record ?? null

/**
 * Called by the beforeinput plugin. Stashes Safari's commit data and grows
 * the record when the browser edits text before the preedit (Android).
 */
export const observeCompositionInput = (view: EditorView, event: InputEvent): void => {
  const record = getRecord(view)

  if (!record) {
    return
  }

  if (event.inputType === 'insertFromComposition' && event.data != null) {
    record.pendingData = event.data
    return
  }

  const range = typeof event.getTargetRanges === 'function' ? event.getTargetRanges()[0] : undefined

  if (!range) {
    return
  }

  // While a commit is pending the descs still describe the previous doc, so
  // a position read now would not match the mapped record
  if (view instanceof ReactEditorView && view.hasPendingCommit) {
    return
  }

  try {
    // Text before the preedit is unchanged, so desc offsets are still valid
    const from = view.posAtDOM(range.startContainer, range.startOffset, 1)

    if (from < record.from) {
      record.from = from
    }
  } catch {
    // The range starts in preedit DOM the descs don't know
  }
}

/**
 * Resets browser-mutated text nodes to what the state says. After a
 * cancelled composition nothing re-renders, so React cannot fix the DOM.
 */
const repairDOMText = (view: EditorView, pos: number): void => {
  const clamped = Math.min(pos, view.state.doc.content.size)
  const { node: container } = view.domAtPos(clamped)
  const root = container.nodeType === 3 ? container.parentNode : container

  if (!root) {
    return
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)

  for (let text = walker.nextNode(); text; text = walker.nextNode()) {
    const desc = (text as Text & { pmViewDesc?: { node?: { text?: string } } }).pmViewDesc
    const expected = desc?.node?.text

    if (typeof expected === 'string' && text.nodeValue !== expected) {
      text.nodeValue = expected
    }
  }
}

/** Commits composed text through `handleTextInput`, so input rules apply. */
const commitText = (view: EditorView, record: CompositionRecord, data: string): void => {
  const size = view.state.doc.content.size
  const from = Math.min(record.from, size)
  const to = Math.min(Math.max(record.to, from), size)

  const buildTr = () => {
    const tr = view.state.tr

    if (record.marks) {
      tr.setStoredMarks(record.marks)
    }
    tr.insertText(data, from, to)
    // Caret after the inserted text; mapping `to` tracks the real insertion
    // end even when replaceRange moved it
    tr.setSelection(Selection.near(tr.doc.resolve(tr.mapping.map(to, 1)), -1))
    return tr
  }

  const handled = view.someProp('handleTextInput', handler =>
    handler(view, from, to, data, buildTr),
  )

  if (!handled) {
    view.dispatch(buildTr())
  }
}

/**
 * Replaces PM's compositionstart/update handlers (returning true skips
 * them): they arm Android's 5s compose-end timer, which would flip
 * `composing` off mid-preedit and let React overwrite the preedit DOM.
 */
const startComposition = (view: EditorView, resetRecord: boolean): boolean => {
  if (!view.editable) {
    return false
  }

  const pluginState = compositionPluginKey.getState(view.state)
  const { input, domObserver } = view as unknown as CompositionViewInternals

  if (pluginState && (resetRecord || !pluginState.record)) {
    // Record from state, not the DOM. Flush the DOM selection into the
    // state first; only safe before `composing` is set.
    if (!view.composing) {
      domObserver.flush()
    }
    const { from, to } = view.state.selection

    pluginState.record = {
      from,
      to,
      marks: view.state.storedMarks,
      pendingData: null,
    }
  }

  clearTimeout(input.composingTimeout)
  input.composing = true
  return true
}

export const composition = (): Plugin<CompositionState> =>
  new Plugin<CompositionState>({
    key: compositionPluginKey,
    state: {
      init: () => ({ record: null }),
      apply: (tr, prev) => {
        if (!prev.record || !tr.docChanged) {
          return prev
        }

        // Map through concurrent (remote/collab) transactions; both ends
        // stay outside content inserted at the boundaries
        const from = tr.mapping.map(prev.record.from, 1)
        const to = Math.max(from, tr.mapping.map(prev.record.to, -1))

        return { record: { ...prev.record, from, to } }
      },
    },
    props: {
      handleDOMEvents: {
        compositionstart: (view: EditorView) => startComposition(view, true),
        compositionupdate: (view: EditorView) => startComposition(view, false),
        compositionend: (view: EditorView, event: Event) => {
          const pluginState = compositionPluginKey.getState(view.state)
          const record = pluginState?.record

          // Not a composition we tracked; leave it to prosemirror-view
          if (!record || !pluginState) {
            return false
          }
          pluginState.record = null

          // End PM's composition state before dispatching, so EditorContent
          // notifies React right away instead of deferring
          const { input } = view as unknown as CompositionViewInternals

          clearTimeout(input.composingTimeout)
          input.composing = false
          input.compositionEndedAt = Date.now()
          input.compositionNode = null

          // `||` so Safari's stashed commit data wins over empty event data
          const data = (event as CompositionEvent).data || record.pendingData || ''

          if (data) {
            commitText(view, record, data)
          } else if (record.from < record.to) {
            // Cancelled over a selection: the browser already deleted it
            view.dispatch(view.state.tr.delete(record.from, record.to))
          } else {
            repairDOMText(view, record.from)
          }

          // Skip prosemirror-view's compositionend handler
          return true
        },
      },
    },
  })
