import type { Range } from '@tiptap/core'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

import type { SuggestionMatch } from './findSuggestionMatch.js'
import { findSuggestionMatch as defaultFindSuggestionMatch } from './findSuggestionMatch.js'
import {
  clientRectFor as clientRectForHelper,
  dispatchExit as dispatchExitHelper,
  shouldKeepDismissed as shouldKeepDismissedHelper,
} from './helpers.js'
import { createSuggestionProps } from './plugin/props.js'
import { createSuggestionState } from './plugin/state.js'
import { createSuggestionView } from './plugin/view.js'
import type { SuggestionOptions } from './types.js'

export type {
  SuggestionFloatingUiConfig,
  SuggestionFloatingUiOptions,
  SuggestionKeyDownProps,
  SuggestionMount,
  SuggestionMountOptions,
  SuggestionOptions,
  SuggestionPlacement,
  SuggestionPositionData,
  SuggestionProps,
} from './types.js'

export const SuggestionPluginKey = new PluginKey('suggestion')

type ShouldKeepDismissedProps = {
  match: Exclude<SuggestionMatch, null>
  dismissedRange: Range
  state: EditorState
  transaction: Transaction
}

/**
 * This utility allows you to create suggestions.
 * @see https://tiptap.dev/api/utilities/suggestion
 */
export function Suggestion<I = any, TSelected = any>({
  pluginKey = SuggestionPluginKey,
  editor,
  char = '@',
  allowSpaces = false,
  allowToIncludeChar = false,
  allowedPrefixes = [' '],
  startOfLine = false,
  decorationTag = 'span',
  decorationClass = 'suggestion',
  decorationContent = '',
  decorationEmptyClass = 'is-empty',
  command = () => null,
  items = () => [],
  minQueryLength = 0,
  debounce = 0,
  initialItems,
  placement = 'bottom-start',
  offset: offsetOption = {},
  container,
  flip = true,
  floatingUi,
  dismissOnOutsideClick = true,
  render = () => ({}),
  allow = () => true,
  findSuggestionMatch = defaultFindSuggestionMatch,
  shouldShow,
  shouldResetDismissed,
}: SuggestionOptions<I, TSelected>) {
  const renderer = render?.()
  const effectiveAllowSpaces = allowSpaces && !allowToIncludeChar

  const clientRectFor = (view: EditorView, decorationNode: Element | null) =>
    clientRectForHelper(editor, view, decorationNode, pluginKey)

  // helper to check if the dismissed suggestion should stay dismissed, with access to editor and options
  function shouldKeepDismissed(props: ShouldKeepDismissedProps) {
    return shouldKeepDismissedHelper({
      ...props,
      editor,
      shouldResetDismissed,
      effectiveAllowSpaces,
    })
  }

  const dispatchExit = (view: EditorView) =>
    dispatchExitHelper({
      view,
      pluginKeyRef: pluginKey,
    })

  return new Plugin({
    key: pluginKey,

    view: () =>
      createSuggestionView({
        editor,
        pluginKey,
        items,
        renderer,
        minQueryLength,
        debounce,
        initialItems,
        placement,
        offset: offsetOption,
        container,
        flip,
        floatingUi,
        dismissOnOutsideClick,
        command,
        clientRectFor,
        dispatchExit,
      }),

    state: createSuggestionState({
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
    }),

    props: createSuggestionProps({
      pluginKey,
      decorationTag,
      decorationClass,
      decorationContent,
      decorationEmptyClass,
      renderer,
      dispatchExit,
    }),
  })
}

/**
 * Programmatically exit a suggestion plugin by dispatching a metadata-only
 * transaction. This is the safe, recommended API to remove suggestion
 * decorations without touching the document or causing mapping errors.
 */
export function exitSuggestion(view: EditorView, pluginKeyRef: PluginKey = SuggestionPluginKey) {
  const tr = view.state.tr.setMeta(pluginKeyRef, { exit: true })
  view.dispatch(tr)
}
