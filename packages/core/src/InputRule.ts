import { EditorState, Plugin, TextSelection } from 'prosemirror-state'
import createChainableState from './helpers/createChainableState'
import { EditorView } from 'prosemirror-view'
import { Range } from './types'

export type InputRuleMatch = {
  index: number,
  text: string,
  replaceWith?: string,
  match?: RegExpMatchArray,
  data?: Record<string, any>,
}

export type ExtendedRegExpMatchArray = RegExpMatchArray & {
  data?: Record<string, any>,
}

export type InputRuleFinder =
  | RegExp
  | ((text: string) => InputRuleMatch | null)

export class InputRule {
  find: InputRuleFinder

  handler: (props: {
    state: EditorState,
    range: Range,
    match: ExtendedRegExpMatchArray,
  }) => void

  constructor(config: {
    find: InputRuleFinder,
    handler: (props: {
      state: EditorState,
      range: Range,
      match: ExtendedRegExpMatchArray,
    }) => void,
  }) {
    this.find = config.find
    this.handler = config.handler
  }
}

const inputRuleMatcherHandler = (text: string, find: InputRuleFinder): ExtendedRegExpMatchArray | null => {
  if (typeof find !== 'function') {
    return find.exec(text)
  }

  const inputRuleMatch = find(text)

  if (!inputRuleMatch) {
    return null
  }

  const result: ExtendedRegExpMatchArray = []

  result.push(inputRuleMatch.text)
  result.index = inputRuleMatch.index
  result.input = text
  result.data = inputRuleMatch.data

  if (inputRuleMatch.replaceWith) {
    if (!inputRuleMatch.text.includes(inputRuleMatch.replaceWith)) {
      console.warn('[tiptap warn]: "inputRuleMatch.replaceWith" has to be part of "inputRuleMatch.text".')
    }

    result.push(inputRuleMatch.replaceWith)
  }

  return result
}

const MAX_MATCH = 500

function run(config: {
  view: EditorView,
  from: number,
  to: number,
  text: string,
  rules: InputRule[],
  plugin: Plugin,
}): any {
  const {
    view,
    from,
    to,
    text,
    rules,
    plugin,
  } = config

  if (view.composing) {
    return false
  }

  const tr = view.state.tr
  const state = createChainableState({
    state: view.state,
    transaction: tr,
  })

  const $from = state.doc.resolve(from)

  if (
    // check for code node
    $from.parent.type.spec.code
    // check for code mark
    || !!($from.nodeBefore || $from.nodeAfter)?.marks.find(mark => mark.type.spec.code)
  ) {
    return false
  }

  const textBefore = $from.parent.textBetween(
    Math.max(0, $from.parentOffset - MAX_MATCH),
    $from.parentOffset,
    undefined,
    '\ufffc',
  ) + text

  rules.forEach(rule => {
    if (tr.steps.length) {
      return
    }

    const match = inputRuleMatcherHandler(textBefore, rule.find)

    if (!match) {
      return
    }

    const range = {
      from: from - (match[0].length - text.length),
      to,
    }

    rule.handler({
      state,
      range,
      match,
    })

    if (!tr.steps.length) {
      return
    }

    tr.setMeta(plugin, {
      transform: tr,
      from,
      to,
      text,
    })

    view.dispatch(tr)
  })

  return !!tr.steps.length
}

export function inputRules(config: { rules: InputRule[] }): Plugin {
  const { rules } = config

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
        return run({
          view,
          from,
          to,
          text,
          rules,
          plugin,
        })
      },

      handleDOMEvents: {
        compositionend: view => {
          setTimeout(() => {
            const { $cursor } = view.state.selection as TextSelection

            if ($cursor) {
              run({
                view,
                from: $cursor.pos,
                to: $cursor.pos,
                text: '',
                rules,
                plugin,
              })
            }
          })

          return false
        },
      },

      handleKeyDown(view, event) {
        if (event.key !== 'Enter') {
          return false
        }

        const { $cursor } = view.state.selection as TextSelection

        if ($cursor) {
          return run({
            view,
            from: $cursor.pos,
            to: $cursor.pos,
            text: '\n',
            rules,
            plugin,
          })
        }

        return false
      },
    },

    // @ts-ignore
    isInputRules: true,
  }) as Plugin

  return plugin
}
