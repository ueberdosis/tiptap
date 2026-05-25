import type { Editor, Range } from '@tiptap/core'
import type { EditorState, PluginKey, Transaction } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

import type { SuggestionMatch } from './findSuggestionMatch.js'
import type { SuggestionOptions, SuggestionPluginState, SuggestionProps } from './types.js'

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
 * Dispatch an exit of the suggestion plugin by:
 * 1. Calling the renderer's onExit hook with the current suggestion state.
 * 2. Dispatching a metadata-only transaction to clear the plugin state.
 */
export function dispatchExit({
  view,
  pluginKeyRef,
  editor,
  command,
  renderer,
}: {
  view: EditorView
  pluginKeyRef: PluginKey
  editor: Editor
  command: NonNullable<SuggestionOptions['command']>
  renderer: ReturnType<NonNullable<SuggestionOptions['render']>> | undefined
}): void {
  try {
    const pluginState: SuggestionPluginState = pluginKeyRef.getState(view.state) as any
    const decorationNode = pluginState?.decorationId
      ? view.dom.querySelector(`[data-decoration-id="${pluginState.decorationId}"]`)
      : null

    const exitProps: SuggestionProps = {
      editor,
      range: pluginState?.range || { from: 0, to: 0 },
      query: pluginState?.query || '',
      text: pluginState?.text || '',
      items: [],
      command: commandProps => {
        return command({ editor, range: pluginState?.range || { from: 0, to: 0 }, props: commandProps })
      },
      decorationNode,
      clientRect: clientRectFor(editor, view, decorationNode, pluginKeyRef),
      loading: false,
      placement: 'bottom-start',
      offset: { mainAxis: 4, crossAxis: 0 },
      flip: true,
    }

    renderer?.onExit?.(exitProps)
  } catch {
    // ignore errors from consumer renderers
  }

  const tr = view.state.tr.setMeta(pluginKeyRef, { exit: true })
  // Dispatch a metadata-only transaction to signal the plugin to exit
  view.dispatch(tr)
}
