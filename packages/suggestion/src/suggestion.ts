import type { Editor, Range } from '@tiptap/core'
import type { EditorState } from '@tiptap/pm/state'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

import { findSuggestionMatch as defaultFindSuggestionMatch } from './findSuggestionMatch.js'

export interface SuggestionOptions<I = any, TSelected = any> {
  /**
   * The plugin key for the suggestion plugin.
   * @default 'suggestion'
   * @example 'mention'
   */
  pluginKey?: PluginKey

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
   * A function that returns the suggestion items in form of an array.
   * @param props The props object.
   * @param props.editor The editor instance.
   * @param props.query The current suggestion query.
   * @returns An array of suggestion items.
   * @example ({ editor, query }) => [{ id: 1, label: 'John Doe' }]
   */
  items?: (props: { query: string; editor: Editor }) => I[] | Promise<I[]>

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
  allow?: (props: { editor: Editor; state: EditorState; range: Range; isActive?: boolean }) => boolean
  findSuggestionMatch?: typeof defaultFindSuggestionMatch
}

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
}

export interface SuggestionKeyDownProps {
  view: EditorView
  event: KeyboardEvent
  range: Range
}

export const SuggestionPluginKey = new PluginKey('suggestion')

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
  render = () => ({}),
  allow = () => true,
  findSuggestionMatch = defaultFindSuggestionMatch,
}: SuggestionOptions<I, TSelected>) {
  let props: SuggestionProps<I, TSelected> | undefined
  const renderer = render?.()

  // Gets the DOM rectangle corresponding to the current editor cursor anchor position
  // Calculates screen coordinates based on Tiptap's cursor position and converts to a DOMRect object
  const getAnchorClientRect = () => {
    const pos = editor.state.selection.$anchor.pos
    const coords = editor.view.coordsAtPos(pos)
    const { top, right, bottom, left } = coords

    try {
      return new DOMRect(left, top, right - left, bottom - top)
    } catch {
      return null
    }
  }

  // Helper to create a clientRect callback for a given decoration node.
  // Returns null when no decoration node is present. Uses the pluginKey's
  // state to resolve the current decoration node on demand, avoiding a
  // duplicated implementation in multiple places.
  const clientRectFor = (view: EditorView, decorationNode: Element | null) => {
    if (!decorationNode) {
      return getAnchorClientRect
    }

    return () => {
      const state = pluginKey.getState(editor.state)
      const decorationId = state?.decorationId
      const currentDecorationNode = view.dom.querySelector(`[data-decoration-id="${decorationId}"]`)

      return currentDecorationNode?.getBoundingClientRect() || null
    }
  }
  // small helper used internally by the view to dispatch an exit
  function dispatchExit(view: EditorView, pluginKeyRef: PluginKey) {
    try {
      const state = pluginKey.getState(view.state)
      const decorationNode = state?.decorationId
        ? view.dom.querySelector(`[data-decoration-id="${state.decorationId}"]`)
        : null

      const exitProps: SuggestionProps = {
        // @ts-ignore editor is available in closure
        editor,
        range: state?.range || { from: 0, to: 0 },
        query: state?.query || null,
        text: state?.text || null,
        items: [],
        command: commandProps => {
          return command({ editor, range: state?.range || { from: 0, to: 0 }, props: commandProps as any })
        },
        decorationNode,
        clientRect: clientRectFor(view, decorationNode),
      }

      renderer?.onExit?.(exitProps)
    } catch {
      // ignore errors from consumer renderers
    }

    const tr = view.state.tr.setMeta(pluginKeyRef, { exit: true })
    // Dispatch a metadata-only transaction to signal the plugin to exit
    view.dispatch(tr)
  }

  const plugin: Plugin<any> = new Plugin({
    key: pluginKey,

    view() {
      return {
        update: async (view, prevState) => {
          const prev = this.key?.getState(prevState)
          const next = this.key?.getState(view.state)

          // See how the state changed
          const moved = prev.active && next.active && prev.range.from !== next.range.from
          const started = !prev.active && next.active
          const stopped = prev.active && !next.active
          const changed = !started && !stopped && prev.query !== next.query

          const handleStart = started || (moved && changed)
          const handleChange = changed || moved
          const handleExit = stopped || (moved && changed)

          // Cancel when suggestion isn't active
          if (!handleStart && !handleChange && !handleExit) {
            return
          }

          const state = handleExit && !handleStart ? prev : next
          const decorationNode = view.dom.querySelector(`[data-decoration-id="${state.decorationId}"]`)

          props = {
            editor,
            range: state.range,
            query: state.query,
            text: state.text,
            items: [],
            command: commandProps => {
              return command({
                editor,
                range: state.range,
                props: commandProps,
              })
            },
            decorationNode,
            clientRect: clientRectFor(view, decorationNode),
          }

          if (handleStart) {
            renderer?.onBeforeStart?.(props)
          }

          if (handleChange) {
            renderer?.onBeforeUpdate?.(props)
          }

          if (handleChange || handleStart) {
            props.items = await items({
              editor,
              query: state.query,
            })
          }

          if (handleExit) {
            renderer?.onExit?.(props)
          }

          if (handleChange) {
            renderer?.onUpdate?.(props)
          }

          if (handleStart) {
            renderer?.onStart?.(props)
          }
        },

        destroy: () => {
          if (!props) {
            return
          }

          renderer?.onExit?.(props)
        },
      }
    },

    state: {
      // Initialize the plugin's internal state.
      init() {
        const state: {
          active: boolean
          range: Range
          query: null | string
          text: null | string
          composing: boolean
          decorationId?: string | null
        } = {
          active: false,
          range: {
            from: 0,
            to: 0,
          },
          query: null,
          text: null,
          composing: false,
        }

        return state
      },

      // Apply changes to the plugin state from a view transaction.
      apply(transaction, prev, _oldState, state) {
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

          return next
        }

        next.composing = composing

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
            allowSpaces,
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
            })
          ) {
            next.active = true
            next.decorationId = prev.decorationId ? prev.decorationId : decorationId
            next.range = match.range
            next.query = match.query
            next.text = match.text
          } else {
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
    },

    props: {
      // Call the keydown hook if suggestion is active.
      handleKeyDown(view, event) {
        const { active, range } = plugin.getState(view.state)

        if (!active) {
          return false
        }

        // If Escape is pressed, call onExit and dispatch a metadata-only
        // transaction to unset the suggestion state. This provides a safe
        // and deterministic way to exit the suggestion without altering the
        // document (avoids transaction mapping/mismatch issues).
        if (event.key === 'Escape' || event.key === 'Esc') {
          const state = plugin.getState(view.state)
          const cachedNode = props?.decorationNode ?? null
          const decorationNode =
            cachedNode ??
            (state?.decorationId ? view.dom.querySelector(`[data-decoration-id="${state.decorationId}"]`) : null)

          // Give the consumer a chance to handle Escape via onKeyDown first.
          // If the consumer returns `true` we assume they handled the event and
          // we won't call onExit/dispatchExit so they can both prevent
          // propagation and decide whether to close the suggestion themselves.
          const handledByKeyDown = renderer?.onKeyDown?.({ view, event, range: state.range }) || false

          if (handledByKeyDown) {
            return true
          }

          const exitProps: SuggestionProps = {
            editor,
            range: state.range,
            query: state.query,
            text: state.text,
            items: [],
            command: commandProps => {
              return command({ editor, range: state.range, props: commandProps as any })
            },
            decorationNode,
            // If we have a cached decoration node, use it for the clientRect
            // to avoid another DOM lookup. If not, leave clientRect null and
            // let consumer decide if they want to query.
            clientRect: decorationNode
              ? () => {
                  return decorationNode.getBoundingClientRect() || null
                }
              : null,
          }

          renderer?.onExit?.(exitProps)

          // dispatch metadata-only transaction to unset the plugin state
          dispatchExit(view, pluginKey)

          return true
        }

        const handled = renderer?.onKeyDown?.({ view, event, range }) || false
        return handled
      },

      // Setup decorator on the currently active suggestion.
      decorations(state) {
        const { active, range, decorationId, query } = plugin.getState(state)

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
            'data-decoration-id': decorationId,
            'data-decoration-content': decorationContent,
          }),
        ])
      },
    },
  })

  return plugin
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
