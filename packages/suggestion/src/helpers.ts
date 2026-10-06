import type { Editor, Range } from '@tiptap/core'
import type { EditorState, PluginKey, Transaction } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

import type { SuggestionMatch } from './findSuggestionMatch.js'
import type { SuggestionOptions, SuggestionPluginState } from './types.js'

/**
 * Returns true if the transaction inserted any whitespace or newline character.
 * Used to determine when a dismissed suggestion should become active again.
 */
export function hasInsertedWhitespace(transaction: Transaction): boolean {
  if (!transaction.docChanged) {
    return false
  }
  return transaction.steps.some(step => {
    const slice = (step as any).slice
    if (!slice?.content) {
      return false
    }
    // textBetween with '\n' as block separator catches both inline spaces and newlines
    const inserted = slice.content.textBetween(0, slice.content.size, '\n')
    return /\s/.test(inserted)
  })
}

/**
 * Gets the DOM rectangle corresponding to the current editor cursor anchor position.
 * Calculates screen coordinates based on Tiptap's cursor position and converts to a DOMRect object.
 */
export function getAnchorClientRect(editor: Editor): () => DOMRect | null {
  return () => {
    const pos = editor.state.selection.$anchor.pos
    const coords = editor.view.coordsAtPos(pos)
    const { top, right, bottom, left } = coords

    try {
      return new DOMRect(left, top, right - left, bottom - top)
    } catch {
      return null
    }
  }
}

/**
 * Creates a clientRect callback for a given decoration node.
 * Returns the anchor rect when no decoration node is present.
 * Uses the pluginKey's state to resolve the current decoration node on demand.
 */
export function clientRectFor(
  editor: Editor,
  view: EditorView,
  decorationNode: Element | null,
  pluginKey: PluginKey,
): () => DOMRect | null {
  if (!decorationNode) {
    return getAnchorClientRect(editor)
  }

  return () => {
    const state: SuggestionPluginState = pluginKey.getState(editor.state) as any
    const decorationId = state?.decorationId
    const currentDecorationNode = view.dom.querySelector(`[data-decoration-id="${decorationId}"]`)

    return currentDecorationNode?.getBoundingClientRect() || null
  }
}

/**
 * Determines whether a dismissed suggestion should stay dismissed.
 * Returns `true` (keep dismissed) or `false` (allow reactivation).
 */
export function shouldKeepDismissed({
  match,
  dismissedRange,
  state,
  transaction,
  editor,
  shouldResetDismissed,
  effectiveAllowSpaces,
}: {
  match: Exclude<SuggestionMatch, null>
  dismissedRange: Range
  state: EditorState
  transaction: Transaction
  editor: Editor
  shouldResetDismissed?: SuggestionOptions['shouldResetDismissed']
  effectiveAllowSpaces: boolean
}): boolean {
  if (
    shouldResetDismissed?.({
      editor,
      state,
      range: dismissedRange,
      match,
      transaction,
      allowSpaces: effectiveAllowSpaces,
    })
  ) {
    return false
  }

  if (effectiveAllowSpaces) {
    return match.range.from === dismissedRange.from
  }

  return match.range.from === dismissedRange.from && !hasInsertedWhitespace(transaction)
}

/**
 * Dispatch an exit of the suggestion plugin by dispatching a metadata-only
 * transaction to clear the plugin state. The renderer's onExit hook is NOT
 * called here — it fires via the plugin view's stopped transition, which
 * builds SuggestionProps consistently with the normal lifecycle.
 *
 * This prevents a double onExit call (one from dispatchExit, one from the
 * view's update) and keeps exitSuggestion consistent with Escape-triggered
 * exits.
 */
export function dispatchExit({
  view,
  pluginKeyRef,
}: {
  view: EditorView
  pluginKeyRef: PluginKey
}): void {
  const tr = view.state.tr.setMeta(pluginKeyRef, { exit: true })
  view.dispatch(tr)
}
