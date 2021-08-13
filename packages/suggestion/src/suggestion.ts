import { Editor, Range } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view'
import { findSuggestionMatch } from './findSuggestionMatch'

export interface SuggestionOptions {
  pluginKey?: PluginKey,
  editor: Editor,
  char?: string,
  allowSpaces?: boolean,
  startOfLine?: boolean,
  decorationTag?: string,
  decorationClass?: string,
  command?: (props: {
    editor: Editor,
    range: Range,
    props: any,
  }) => void,
  items?: (query: string) => any[],
  render?: () => {
    onStart?: (props: SuggestionProps) => void,
    onUpdate?: (props: SuggestionProps) => void,
    onExit?: (props: SuggestionProps) => void,
    onKeyDown?: (props: SuggestionKeyDownProps) => boolean,
  },
  allow?: (props: {
    editor: Editor,
    range: Range,
  }) => boolean,
}

export interface SuggestionProps {
  editor: Editor,
  range: Range,
  query: string,
  text: string,
  items: any[],
  command: (props: any) => void,
  decorationNode: Element | null,
  clientRect: (() => DOMRect) | null,
}

export interface SuggestionKeyDownProps {
  view: EditorView,
  event: KeyboardEvent,
  range: Range,
}

export const SuggestionPluginKey = new PluginKey('suggestion')

export function Suggestion({
  pluginKey = SuggestionPluginKey,
  editor,
  char = '@',
  allowSpaces = false,
  startOfLine = false,
  decorationTag = 'span',
  decorationClass = 'suggestion',
  command = () => null,
  items = () => [],
  render = () => ({}),
  allow = () => true,
}: SuggestionOptions) {

  const renderer = render?.()

  return new Plugin({
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
          const handleStart = started || moved
          const handleChange = changed && !moved
          const handleExit = stopped || moved

          // Cancel when suggestion isn't active
          if (!handleStart && !handleChange && !handleExit) {
            return
          }

          const state = handleExit && !handleStart
            ? prev
            : next
          const decorationNode = document.querySelector(`[data-decoration-id="${state.decorationId}"]`)
          const props: SuggestionProps = {
            editor,
            range: state.range,
            query: state.query,
            text: state.text,
            items: (handleChange || handleStart)
              ? await items(state.query)
              : [],
            command: commandProps => {
              command({
                editor,
                range: state.range,
                props: commandProps,
              })
            },
            decorationNode,
            // virtual node for popper.js or tippy.js
            // this can be used for building popups without a DOM node
            clientRect: decorationNode
              ? () => decorationNode.getBoundingClientRect()
              : null,
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
      }
    },

    state: {
      // Initialize the plugin's internal state.
      init() {
        return {
          active: false,
          range: {},
          query: null,
          text: null,
        }
      },

      // Apply changes to the plugin state from a view transaction.
      apply(transaction, prev) {
        const { selection } = transaction
        const next = { ...prev }

        // We can only be suggesting if there is no selection
        if (selection.from === selection.to) {
          // Reset active state if we just left the previous suggestion range
          if (selection.from < prev.range.from || selection.from > prev.range.to) {
            next.active = false
          }

          // Try to match against where our cursor currently is
          const match = findSuggestionMatch({
            char,
            allowSpaces,
            startOfLine,
            $position: selection.$from,
          })
          const decorationId = `id_${Math.floor(Math.random() * 0xFFFFFFFF)}`

          // If we found a match, update the current state to show it
          if (match && allow({ editor, range: match.range })) {
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
          next.range = {}
          next.query = null
          next.text = null
        }

        return next
      },
    },

    props: {
      // Call the keydown hook if suggestion is active.
      handleKeyDown(view, event) {
        const { active, range } = this.getState(view.state)

        if (!active) {
          return false
        }

        return renderer?.onKeyDown?.({ view, event, range }) || false
      },

      // Setup decorator on the currently active suggestion.
      decorations(state) {
        const { active, range, decorationId } = this.getState(state)

        if (!active) {
          return null
        }

        return DecorationSet.create(state.doc, [
          Decoration.inline(range.from, range.to, {
            nodeName: decorationTag,
            class: decorationClass,
            'data-decoration-id': decorationId,
          }),
        ])
      },
    },
  })
}
