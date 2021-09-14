// source: https://github.com/ProseMirror/prosemirror-inputrules/blob/master/src/inputrules.js

import { EditorState, Plugin, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

const MAX_MATCH = 500

function run(
  view: EditorView,
  from: number,
  to: number,
  text: string,
  rules: InputRule[],
  plugin: Plugin,
) {
  if (view.composing) {
    return false
  }

  const state = view.state
  const $from = state.doc.resolve(from)

  if ($from.parent.type.spec.code) {
    return false
  }

  const textBefore = $from.parent.textBetween(
    Math.max(0, $from.parentOffset - MAX_MATCH),
    $from.parentOffset,
    undefined,
    '\ufffc',
  ) + text

  for (let i = 0; i < rules.length; i += 1) {
    const match = rules[i].match.exec(textBefore)
    const tr = match && rules[i].handler(state, match, from - (match[0].length - text.length), to)

    if (!tr) {
      continue
    }

    tr.setMeta(plugin, {
      transform: tr,
      from,
      to,
      text,
    })

    view.dispatch(tr)

    return true
  }

  return false
}

function stringHandler(string: string) {
  return function (state: EditorState, match: string[], start: number, end: number) {
    let insert = string

    if (match[1]) {
      const offset = match[0].lastIndexOf(match[1])

      insert += match[0].slice(offset + match[1].length)
      start += offset

      const cutOff = start - end

      if (cutOff > 0) {
        insert = match[0].slice(offset - cutOff, offset) + insert
        start = end
      }
    }

    return state.tr.insertText(insert, start, end)
  }
}

// Create an input rules plugin. When enabled, it will cause text
// input that matches any of the given rules to trigger the rule's
// action.
export function inputRules(config: { rules: InputRule[] }): Plugin {
  const { rules } = config

  // @ts-ignore
  const plugin = new Plugin({
    state: {
      init() {
        return null
      },
      apply(tr, prev) {
        const stored = tr.getMeta(this)

        if (stored) {
          return stored
        }

        return tr.selectionSet || tr.docChanged
          ? null
          : prev
      },
    },

    props: {
      handleTextInput(view, from, to, text) {
        return run(view, from, to, text, rules, plugin)
      },

      handleDOMEvents: {
        compositionend: view => {
          setTimeout(() => {
            // @ts-ignore
            const { $cursor } = view.state.selection

            if ($cursor) {
              run(view, $cursor.pos, $cursor.pos, '', rules, plugin)
            }
          })

          return false
        },
      },

      handleKeyDown(view, event) {
        if (event.key !== 'Enter') {
          return false
        }

        // @ts-ignore
        const { $cursor } = view.state.selection

        if ($cursor) {
          return run(view, $cursor.pos, $cursor.pos, '\n', rules, plugin)
        }

        return false
      },
    },

    // @ts-ignore
    isInputRules: true,
  }) as Plugin

  return plugin
}

// This is a command that will undo an input rule, if applying such a
// rule was the last thing that the user did.
export function undoInputRule(state: EditorState, dispatch?: (tr: Transaction) => boolean) {
  const plugins = state.plugins

  for (let i = 0; i < plugins.length; i += 1) {
    const plugin = plugins[i]
    let undoable

    if (plugin.spec.isInputRules && (undoable = plugin.getState(state))) {
      if (dispatch) {
        const tr = state.tr
        const toUndo = undoable.transform

        for (let j = toUndo.steps.length - 1; j >= 0; j -= 1) {
          tr.step(toUndo.steps[j].invert(toUndo.docs[j]))
        }

        if (undoable.text) {
          const marks = tr.doc.resolve(undoable.from).marks()
          tr.replaceWith(undoable.from, undoable.to, state.schema.text(undoable.text, marks))
        } else {
          tr.delete(undoable.from, undoable.to)
        }

        dispatch(tr)
      }

      return true
    }
  }

  return false
}

// ::- Input rules are regular expressions describing a piece of text
// that, when typed, causes something to happen. This might be
// changing two dashes into an emdash, wrapping a paragraph starting
// with `"> "` into a blockquote, or something entirely different.
export class InputRule {
  // something and the text directly in front of the cursor matches
  // `match`, which should end with `$`.
  //
  // The `handler` can be a string, in which case the matched text, or
  // the first matched group in the regexp, is replaced by that
  // string.
  //
  // Or a it can be a function, which will be called with the match
  // array produced by
  // [`RegExp.exec`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec),
  // as well as the start and end of the matched range, and which can
  // return a [transaction](#state.Transaction) that describes the
  // rule's effect, or null to indicate the input was not handled.
  constructor(
    match: RegExp,
    handler: (state: EditorState, match: string[], start: number, end: number) => Transaction | undefined,
  ) {
    this.match = match
    this.handler = typeof handler === 'string'
      ? stringHandler(handler)
      : handler
  }
}
