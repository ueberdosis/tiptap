import type { EditorState, PluginKey } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

import type { SuggestionKeyDownProps, SuggestionPluginState } from '../types.js'

/**
 * Creates the `props` object for the suggestion ProseMirror plugin.
 * Contains `handleKeyDown` for keyboard handling and `decorations`
 * for rendering the suggestion highlight.
 */
export interface CreateSuggestionPropsOptions {
  pluginKey: PluginKey
  decorationTag: string
  decorationClass: string
  decorationContent: string
  decorationEmptyClass: string
  renderer: { onKeyDown?: (props: SuggestionKeyDownProps) => boolean } | undefined
  dispatchExit: (view: EditorView) => void
}

/**
 * Creates the `props` object for the suggestion ProseMirror plugin.
 * Contains `handleKeyDown` for keyboard handling and `decorations`
 * for rendering the suggestion highlight.
 */
export function createSuggestionProps({
  pluginKey,
  decorationTag,
  decorationClass,
  decorationContent,
  decorationEmptyClass,
  renderer,
  dispatchExit,
}: CreateSuggestionPropsOptions) {
  return {
    /**
     * Call the keydown hook if suggestion is active.
     */
    handleKeyDown(view: EditorView, event: KeyboardEvent) {
      const state: SuggestionPluginState = pluginKey.getState(view.state) as any

      if (!state.active) {
        return false
      }

      // If Escape is pressed, call onKeyDown and dispatch a metadata-only
      // transaction to unset the suggestion state. This provides a safe
      // and deterministic way to exit the suggestion without altering the
      // document (avoids transaction mapping/mismatch issues).
      if (event.key === 'Escape' || event.key === 'Esc') {
        // Allow the consumer to react to Escape, but always clear the
        // suggestion state afterward so the decoration is removed too.
        renderer?.onKeyDown?.({ view, event, range: state.range })

        // dispatch metadata-only transaction to unset the plugin state
        dispatchExit(view)

        return true
      }

      const handled = renderer?.onKeyDown?.({ view, event, range: state.range }) || false
      return handled
    },

    /**
     * Setup decorator on the currently active suggestion.
     */
    decorations(state: EditorState) {
      const pluginState: SuggestionPluginState = pluginKey.getState(state) as any
      const { active, range, decorationId, query } = pluginState

      if (!active) {
        return null
      }

      const isEmpty = !query?.length
      const classNames = [decorationClass]

      if (isEmpty) {
        classNames.push(decorationEmptyClass)
      }

      return DecorationSet.create(state.doc, [
        Decoration.inline(range.from, range.to, {
          nodeName: decorationTag,
          class: classNames.join(' '),
          'data-decoration-id': decorationId || undefined,
          'data-decoration-content': decorationContent,
        }),
      ])
    },
  }
}
