import { EditorState, Plugin, TextSelection } from 'prosemirror-state'
import createChainableState from './helpers/createChainableState'
import { EditorView } from 'prosemirror-view'
import { Range } from './types'

export type InputRuleMatch = {
  index: number,
  text: string,
  replaceWith?: string,
  match?: RegExpMatchArray,
  [key: string]: any,
}

export type ExtendedRegExpMatchArray = RegExpMatchArray & {
  [key: string]: any,
}

export type InputRuleMatcher =
  | RegExp
  | ((text: string) => InputRuleMatch | null)

export class InputRule {
  matcher: InputRuleMatcher

  handler: (props: {
    state: EditorState,
    range: Range,
    match: ExtendedRegExpMatchArray,
  }) => void

  constructor(config: {
    matcher: InputRuleMatcher,
    handler: (props: {
      state: EditorState,
      range: Range,
      match: ExtendedRegExpMatchArray,
    }) => void,
  }) {
    this.matcher = config.matcher
    this.handler = config.handler
  }
}

const inputRuleMatcherHandler = (text: string, matcher: InputRuleMatcher): ExtendedRegExpMatchArray | null => {
  if (typeof matcher !== 'function') {
    return matcher.exec(text)
  }

  const inputRuleMatch = matcher(text)

  if (!inputRuleMatch) {
    return null
  }

  const result: ExtendedRegExpMatchArray = []

  result.push(inputRuleMatch.text)
  result.index = inputRuleMatch.index
  result.input = text

  if (inputRuleMatch.replaceWith) {
    if (!inputRuleMatch.text.includes(inputRuleMatch.replaceWith)) {
      console.warn('[tiptap warn]: "inputRuleMatch.replaceWith" has to be part of "inputRuleMatch.text".')
    }

    result.push(inputRuleMatch.replaceWith)
  }

  Object
    .keys(inputRuleMatch)
    .filter(key => !['index', 'text', 'replaceWith'].includes(key))
    .forEach(key => {
      result[key] = inputRuleMatch[key]
    })

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

  if ($from.parent.type.spec.code) {
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

    const match = inputRuleMatcherHandler(textBefore, rule.matcher)

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
          run({
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
