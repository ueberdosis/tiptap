import type { Editor, Range } from '@tiptap/core'
import type { EditorState, PluginKey, Transaction } from '@tiptap/pm/state'

import type {
  findSuggestionMatch as defaultFindSuggestionMatch,
  SuggestionMatch,
} from '../findSuggestionMatch.js'
import type { SuggestionOptions, SuggestionPluginState } from '../types.js'

export interface CreateSuggestionStateOptions {
  editor: Editor
  char: string
  effectiveAllowSpaces: boolean
  allowToIncludeChar: boolean
  allowedPrefixes: string[] | null
  startOfLine: boolean
  findSuggestionMatch: typeof defaultFindSuggestionMatch
  allow: Exclude<SuggestionOptions['allow'], undefined>
  shouldShow?: SuggestionOptions['shouldShow']
  shouldKeepDismissed: (props: {
    match: Exclude<SuggestionMatch, null>
    dismissedRange: Range
    state: EditorState
    transaction: Transaction
  }) => boolean
  pluginKey: PluginKey
}

/**
 * Creates the `state` object for the suggestion ProseMirror plugin.
 * Contains `init()` and `apply()` for managing the plugin's internal state
 * across transactions.
 */
export function createSuggestionState({
  editor,
  char,
  effectiveAllowSpaces,
  allowToIncludeChar,
  allowedPrefixes,
  startOfLine,
  findSuggestionMatch,
  allow,
  shouldShow,
  shouldKeepDismissed,
  pluginKey,
}: CreateSuggestionStateOptions) {
  return {
    /**
     * Initialize the plugin's internal state.
     */
    init(): SuggestionPluginState {
      return {
        active: false,
        range: { from: 0, to: 0 },
        query: null,
        text: null,
        composing: false,
        dismissedRange: null,
      }
    },

    /**
     * Apply changes to the plugin state from a view transaction.
     */
    apply(
      transaction: Transaction,
      prev: SuggestionPluginState,
      _oldState: EditorState,
      state: EditorState,
    ): SuggestionPluginState {
      const { isEditable } = editor
      const { composing } = editor.view
      const { selection } = transaction
      const { empty, from } = selection
      const next = { ...prev }

      // If a transaction carries the exit meta for this plugin, immediately
      // deactivate the suggestion. This allows metadata-only transactions
      // (dispatched by escape or programmatic exit) to deterministically
      // clear decorations without changing the document.
      const meta = transaction.getMeta(pluginKey)
      if (meta && meta.exit) {
        next.active = false
        next.decorationId = null
        next.range = { from: 0, to: 0 }
        next.query = null
        next.text = null
        next.dismissedRange = prev.active ? { ...prev.range } : prev.dismissedRange

        return next
      }

      next.composing = composing

      if (transaction.docChanged && next.dismissedRange !== null) {
        next.dismissedRange = {
          from: transaction.mapping.map(next.dismissedRange.from),
          to: transaction.mapping.map(next.dismissedRange.to),
        }
      }

      // We can only be suggesting if the view is editable, and:
      //   * there is no selection, or
      //   * a composition is active (see: https://github.com/ueberdosis/tiptap/issues/1449)
      if (isEditable && (empty || editor.view.composing)) {
        // Reset active state if we just left the previous suggestion range
        if ((from < prev.range.from || from > prev.range.to) && !composing && !prev.composing) {
          next.active = false
        }

        // Try to match against where our cursor currently is
        const match = findSuggestionMatch({
          char,
          allowSpaces: effectiveAllowSpaces,
          allowToIncludeChar,
          allowedPrefixes,
          startOfLine,
          $position: selection.$from,
        })
        const decorationId = `id_${Math.floor(Math.random() * 0xffffffff)}`

        // If we found a match, update the current state to show it
        if (
          match &&
          allow({
            editor,
            state,
            range: match.range,
            isActive: prev.active,
          }) &&
          (!shouldShow ||
            shouldShow({
              editor,
              range: match.range,
              query: match.query,
              text: match.text,
              transaction,
            }))
        ) {
          if (
            next.dismissedRange !== null &&
            !shouldKeepDismissed({
              match,
              dismissedRange: next.dismissedRange,
              state,
              transaction,
            })
          ) {
            next.dismissedRange = null
          }

          if (next.dismissedRange === null) {
            next.active = true
            next.decorationId = prev.decorationId || decorationId
            next.range = match.range
            next.query = match.query
            next.text = match.text
          } else {
            next.active = false
          }
        } else {
          if (!match) {
            next.dismissedRange = null
          }
          next.active = false
        }
      } else {
        next.active = false
      }

      // Make sure to empty the range if suggestion is inactive
      if (!next.active) {
        next.decorationId = null
        next.range = { from: 0, to: 0 }
        next.query = null
        next.text = null
      }

      return next
    },
  }
}
