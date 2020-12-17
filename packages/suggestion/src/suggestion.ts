import { Plugin, PluginKey } from 'prosemirror-state'
import { ResolvedPos } from 'prosemirror-model'
import { Decoration, DecorationSet } from 'prosemirror-view'

// Create a matcher that matches when a specific character is typed. Useful for @mentions and #tags.
function triggerCharacter({
  char = '@',
  allowSpaces = false,
  startOfLine = false,
}) {

  return ($position: ResolvedPos) => {
    // cancel if top level node
    if ($position.depth <= 0) {
      return false
    }

    // Matching expressions used for later
    const escapedChar = `\\${char}`
    const suffix = new RegExp(`\\s${escapedChar}$`)
    const prefix = startOfLine ? '^' : ''
    const regexp = allowSpaces
      ? new RegExp(`${prefix}${escapedChar}.*?(?=\\s${escapedChar}|$)`, 'gm')
      : new RegExp(`${prefix}(?:^)?${escapedChar}[^\\s${escapedChar}]*`, 'gm')

    // Lookup the boundaries of the current node
    const textFrom = $position.before()
    const textTo = $position.end()
    const text = $position.doc.textBetween(textFrom, textTo, '\0', '\0')

    let match = regexp.exec(text)
    let position

    while (match !== null) {
      // JavaScript doesn't have lookbehinds; this hacks a check that first character is " "
      // or the line beginning
      const matchPrefix = match.input.slice(Math.max(0, match.index - 1), match.index)

      if (/^[\s\0]?$/.test(matchPrefix)) {
        // The absolute position of the match in the document
        const from = match.index + $position.start()
        let to = from + match[0].length

        // Edge case handling; if spaces are allowed and we're directly in between
        // two triggers
        if (allowSpaces && suffix.test(text.slice(to - 1, to + 1))) {
          match[0] += ' '
          to += 1
        }

        // If the $position is located within the matched substring, return that range
        if (from < $position.pos && to >= $position.pos) {
          position = {
            range: {
              from,
              to,
            },
            query: match[0].slice(char.length),
            text: match[0],
          }
        }
      }

      match = regexp.exec(text)
    }

    return position
  }
}

export function Suggestion({
  matcher = {
    char: '@',
    allowSpaces: false,
    startOfLine: false,
  },
  appendText = null,
  suggestionClass = 'suggestion',
  command = () => false,
  items = [],
  onEnter = (props: any) => false,
  onChange = (props: any) => false,
  onExit = (props: any) => false,
  onKeyDown = (props: any) => false,
  onFilter = (searchItems: any[], query: string) => {
    if (!query) {
      return searchItems
    }

    return searchItems
      .filter(item => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()))
  },
}) {
  return new Plugin({
    key: new PluginKey('suggestions'),

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

          const state = handleExit ? prev : next
          const decorationNode = document.querySelector(`[data-decoration-id="${state.decorationId}"]`)

          // build a virtual node for popper.js or tippy.js
          // this can be used for building popups without a DOM node
          const virtualNode = decorationNode ? {
            getBoundingClientRect() {
              return decorationNode.getBoundingClientRect()
            },
            clientWidth: decorationNode.clientWidth,
            clientHeight: decorationNode.clientHeight,
          } : null

          const props = {
            view,
            range: state.range,
            query: state.query,
            text: state.text,
            decorationNode,
            virtualNode,
            items: (handleChange || handleStart)
              // @ts-ignore
              ? await onFilter(Array.isArray(items) ? items : await items(), state.query)
              : [],
            command: () => {
              console.log('command')
            },
            // command: ({ range, attrs }) => {
            //   command({
            //     range,
            //     attrs,
            //     schema: view.state.schema,
            //   })(view.state, view.dispatch, view)

            //   if (appendText) {
            //     insertText(appendText)(view.state, view.dispatch, view)
            //   }
            // },
          }

          // Trigger the hooks when necessary
          if (handleExit) {
            onExit(props)
          }

          if (handleChange) {
            onChange(props)
          }

          if (handleStart) {
            onEnter(props)
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
      apply(tr, prev) {
        const { selection } = tr
        const next = { ...prev }

        // We can only be suggesting if there is no selection
        if (selection.from === selection.to) {
          // Reset active state if we just left the previous suggestion range
          if (selection.from < prev.range.from || selection.from > prev.range.to) {
            next.active = false
          }

          // Try to match against where our cursor currently is
          const $position = selection.$from
          const match = triggerCharacter(matcher)($position)
          const decorationId = (Math.random() + 1).toString(36).substr(2, 5)

          // If we found a match, update the current state to show it
          if (match) {
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

        if (!active) return false

        return onKeyDown({ view, event, range })
      },

      // Setup decorator on the currently active suggestion.
      decorations(editorState) {
        const { active, range, decorationId } = this.getState(editorState)

        if (!active) return null

        return DecorationSet.create(editorState.doc, [
          Decoration.inline(range.from, range.to, {
            nodeName: 'span',
            class: suggestionClass,
            'data-decoration-id': decorationId,
          }),
        ])
      },
    },
  })
}
