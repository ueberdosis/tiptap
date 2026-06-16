import type { AutoUpdateOptions, Middleware } from '@floating-ui/dom'
import type { Editor, Range } from '@tiptap/core'
import type { EditorState, PluginKey, Transaction } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

import type {
  findSuggestionMatch as defaultFindSuggestionMatch,
  SuggestionMatch,
} from './findSuggestionMatch.js'

export type SuggestionPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'

export type SuggestionFloatingUiOptions = {
  strategy?: 'absolute' | 'fixed'
  middleware?: Middleware[]
}

export type SuggestionFloatingUiConfig = {
  placement: SuggestionPlacement
  strategy: 'absolute' | 'fixed'
  middleware: Middleware[]
}

/**
 * The computed position handed to a custom `onPosition` callback when using
 * managed positioning via {@link SuggestionProps.autoPosition}.
 */
export type SuggestionPositionData = {
  x: number
  y: number
  placement: SuggestionPlacement
  strategy: 'absolute' | 'fixed'
}

/**
 * Options for managed positioning via {@link SuggestionProps.autoPosition}.
 */
export type SuggestionAutoPositionOptions = {
  /**
   * Override how the computed position is applied to the element.
   * When provided, the plugin stops writing `style.left`/`style.top` itself and
   * hands you the computed coordinates so you can apply them however you want
   * (custom transforms, animation, writing to a framework ref, etc.).
   */
  onPosition?: (data: SuggestionPositionData) => void

  /**
   * Options forwarded to Floating UI's `autoUpdate`. Use this to opt into
   * `animationFrame` polling for anchors that move inside transformed or
   * animated containers, or to disable specific observers.
   * @see https://floating-ui.com/docs/autoUpdate
   */
  autoUpdate?: AutoUpdateOptions
}

/**
 * Attaches managed positioning to a floating element. The plugin keeps the
 * element anchored to the suggestion's cursor rect and automatically
 * repositions it on scroll, resize, and layout shifts via Floating UI's
 * `autoUpdate` — consumers do not need to attach their own listeners.
 *
 * Returns a cleanup function that tears down the listeners. Call it from
 * `onExit` (and before re-binding) to avoid leaks.
 */
export type SuggestionAutoPosition = (
  element: HTMLElement,
  options?: SuggestionAutoPositionOptions,
) => () => void

export type PluginState = {
  active: boolean
  range: Range
  query: string | null
  text: string | null
  decorationId?: string
}

export interface SuggestionOptions<I = any, TSelected = any> {
  /**
   * The plugin key for the suggestion plugin.
   * @default 'suggestion'
   * @example 'mention'
   */
  pluginKey?: PluginKey

  /**
   * A function that returns a boolean to indicate if the suggestion should be active.
   * This is useful to prevent suggestions from opening for remote users in collaborative environments.
   * @param props The props object.
   * @param props.editor The editor instance.
   * @param props.range The range of the suggestion.
   * @param props.query The current suggestion query.
   * @param props.text The current suggestion text.
   * @param props.transaction The current transaction.
   * @returns {boolean}
   * @example ({ transaction }) => isChangeOrigin(transaction)
   */
  shouldShow?: (props: {
    editor: Editor
    range: Range
    query: string
    text: string
    transaction: Transaction
  }) => boolean

  /**
   * Controls when a dismissed suggestion becomes active again.
   * Return `true` to clear the dismissed context for the current transaction.
   */
  shouldResetDismissed?: (props: {
    editor: Editor
    state: EditorState
    range: Range
    match: Exclude<SuggestionMatch, null>
    transaction: Transaction
    allowSpaces: boolean
  }) => boolean

  /**
   * The editor instance.
   * @default null
   */
  editor: Editor

  /**
   * The character that triggers the suggestion.
   * @default '@'
   * @example '#'
   */
  char?: string

  /**
   * Allow spaces in the suggestion query. Not compatible with `allowToIncludeChar`. Will be disabled if `allowToIncludeChar` is set to `true`.
   * @default false
   * @example true
   */
  allowSpaces?: boolean

  /**
   * Allow the character to be included in the suggestion query. Not compatible with `allowSpaces`.
   * @default false
   */
  allowToIncludeChar?: boolean

  /**
   * Allow prefixes in the suggestion query.
   * @default [' ']
   * @example [' ', '@']
   */
  allowedPrefixes?: string[] | null

  /**
   * Only match suggestions at the start of the line.
   * @default false
   * @example true
   */
  startOfLine?: boolean

  /**
   * The tag name of the decoration node.
   * @default 'span'
   * @example 'div'
   */
  decorationTag?: string

  /**
   * The class name of the decoration node.
   * @default 'suggestion'
   * @example 'mention'
   */
  decorationClass?: string

  /**
   * Creates a decoration with the provided content.
   * @param decorationContent - The content to display in the decoration
   * @default "" - Creates an empty decoration if no content provided
   */
  decorationContent?: string

  /**
   * The class name of the decoration node when it is empty.
   * @default 'is-empty'
   * @example 'is-empty'
   */
  decorationEmptyClass?: string

  /**
   * A function that is called when a suggestion is selected.
   * @param props The props object.
   * @param props.editor The editor instance.
   * @param props.range The range of the suggestion.
   * @param props.props The props of the selected suggestion.
   * @returns void
   * @example ({ editor, range, props }) => { props.command(props.props) }
   */
  command?: (props: { editor: Editor; range: Range; props: TSelected }) => void

  /**
   * Minimum query length before `items()` is called.
   * When the query is shorter, empty items are passed to the renderer.
   * @default 0 (no filter, same as before)
   * @example 2
   */
  minQueryLength?: number

  /**
   * Debounce in milliseconds. When set, `items()` will only be called
   * after the user stops typing for this duration.
   * @default 0 (no debounce, same as before)
   * @example 300
   */
  debounce?: number

  /**
   * Items shown immediately when the suggestion popup opens,
   * before the async `items()` call resolves.
   * Useful for showing recent or popular items while loading.
   * @default undefined (no pre-populated items)
   */
  initialItems?: I[]

  /**
   * Placement of the popup relative to the cursor.
   * Consumers can read this from `SuggestionProps` to configure their positioning library.
   * @default 'bottom-start'
   */
  placement?: SuggestionPlacement

  /**
   * Offset of the popup in pixels.
   * Consumers can read this from `SuggestionProps` to configure their positioning library.
   * @default { mainAxis: 4, crossAxis: 0 }
   */
  offset?: { mainAxis?: number; crossAxis?: number }

  /**
   * CSS selector or element that defines the containment context for the popup.
   * Consumers can read this from `SuggestionProps` when rendering inside modals or dialogs.
   * @default undefined (no containment)
   */
  container?: string | HTMLElement

  /**
   * Whether the popup should automatically flip when there isn't enough space.
   * Consumers can read this from `SuggestionProps` to configure their positioning library.
   * @default true
   */
  flip?: boolean

  /**
   * Additional Floating UI options and middleware passed through to the renderer.
   * The plugin keeps ownership of the anchor and placement, but consumers can
   * append custom middleware here.
   */
  floatingUi?: SuggestionFloatingUiOptions

  /**
   * A function that returns the suggestion items in form of an array.
   * @param props The props object.
   * @param props.editor The editor instance.
   * @param props.query The current suggestion query.
   * @returns An array of suggestion items.
   * @example ({ editor, query }) => [{ id: 1, label: 'John Doe' }]
   */
  items?: (props: { query: string; editor: Editor; signal: AbortSignal }) => I[] | Promise<I[]>

  /**
   * The render function for the suggestion.
   * @returns An object with render functions.
   */
  render?: () => {
    onBeforeStart?: (props: SuggestionProps<I, TSelected>) => void
    onStart?: (props: SuggestionProps<I, TSelected>) => void
    onBeforeUpdate?: (props: SuggestionProps<I, TSelected>) => void
    onUpdate?: (props: SuggestionProps<I, TSelected>) => void
    onExit?: (props: SuggestionProps<I, TSelected>) => void
    onKeyDown?: (props: SuggestionKeyDownProps) => boolean
  }

  /**
   * A function that returns a boolean to indicate if the suggestion should be active.
   * @param props The props object.
   * @returns {boolean}
   */
  allow?: (props: {
    editor: Editor
    state: EditorState
    range: Range
    isActive?: boolean
  }) => boolean
  findSuggestionMatch?: typeof defaultFindSuggestionMatch
}

/**
 * The props passed to the suggestion's render functions (onStart, onUpdate, onExit).
 */
export interface SuggestionProps<I = any, TSelected = any> {
  /**
   * The editor instance.
   */
  editor: Editor

  /**
   * The range of the suggestion.
   */
  range: Range

  /**
   * The current suggestion query.
   */
  query: string

  /**
   * The current suggestion text.
   */
  text: string

  /**
   * The suggestion items array.
   */
  items: I[]

  /**
   * A function that is called when a suggestion is selected.
   * @param props The props object.
   * @returns void
   */
  command: (props: TSelected) => void

  /**
   * The decoration node HTML element
   * @default null
   */
  decorationNode: Element | null

  /**
   * The function that returns the client rect
   * @default null
   * @example () => new DOMRect(0, 0, 0, 0)
   */
  clientRect?: (() => DOMRect | null) | null

  /**
   * Placement of the popup relative to the cursor.
   * @default 'bottom-start'
   */
  placement: SuggestionPlacement

  /**
   * Offset of the popup in pixels.
   * @default { mainAxis: 4, crossAxis: 0 }
   */
  offset: { mainAxis: number; crossAxis: number }

  /**
   * CSS selector or element that defines the containment context for the popup.
   * @default undefined
   */
  container?: string | HTMLElement

  /**
   * Whether the popup should automatically flip when there isn't enough space.
   * @default true
   */
  flip: boolean

  /**
   * Resolved Floating UI config for direct use with `computePosition()`.
   * Reach for this only when you opt out of managed positioning and want to
   * run the positioning loop yourself.
   */
  floatingUi: SuggestionFloatingUiConfig

  /**
   * Attaches fully managed positioning to your floating element.
   *
   * Pass the element you rendered (e.g. from `ReactRenderer`/`VueRenderer`) and
   * the plugin keeps it anchored to the cursor, automatically repositioning on
   * scroll, resize, and layout shifts — no manual listeners required. Returns a
   * cleanup function to call in `onExit`.
   *
   * For full control, skip this and use {@link SuggestionProps.floatingUi} +
   * {@link SuggestionProps.clientRect} to run your own positioning loop.
   *
   * @example
   * ```ts
   * onStart: props => {
   *   document.body.appendChild(component.element)
   *   cleanup = props.autoPosition(component.element)
   * },
   * onExit: () => cleanup?.(),
   * ```
   */
  autoPosition: SuggestionAutoPosition

  /**
   * Whether the items are currently being loaded.
   * `true` before the async `items()` call resolves.
   * Useful for showing a loading spinner or skeleton.
   * @default false
   */
  loading: boolean
}

/**
 * The props passed to the suggestion's onKeyDown render function
 */
export interface SuggestionKeyDownProps {
  view: EditorView
  event: KeyboardEvent
  range: Range
}

/** @internal Internal state shape for the suggestion plugin. */
export interface SuggestionPluginState {
  active: boolean
  range: Range
  query: null | string
  text: null | string
  composing: boolean
  decorationId?: string | null
  dismissedRange: Range | null
}
