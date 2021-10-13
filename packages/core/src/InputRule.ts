import { EditorView } from 'prosemirror-view'
import { EditorState, Plugin, TextSelection } from 'prosemirror-state'
import createChainableState from './helpers/createChainableState'
import isRegExp from './utilities/isRegExp'
import { Range, ExtendedRegExpMatchArray } from './types'

export type InputRuleMatch = {
  index: number,
  text: string,
  replaceWith?: string,
  match?: RegExpMatchArray,
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
  if (isRegExp(find)) {
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
      console.warn('[tiptap warn]: "inputRuleMatch.replaceWith" must be part of "inputRuleMatch.text".')
    }

    result.push(inputRuleMatch.replaceWith)
  }

  return result
}

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

  const $from = view.state.doc.resolve(from)

  if (
    // check for code node
    $from.parent.type.spec.code
    // check for code mark
    || !!($from.nodeBefore || $from.nodeAfter)?.marks.find(mark => mark.type.spec.code)
  ) {
    return false
  }

  let matched = false
  const maxMatch = 500
  const textBefore = $from.parent.textBetween(
    Math.max(0, $from.parentOffset - maxMatch),
    $from.parentOffset,
    undefined,
    '\ufffc',
  ) + text

  rules.forEach(rule => {
    if (matched) {
      return
    }

    const match = inputRuleMatcherHandler(textBefore, rule.find)

    if (!match) {
      return
    }

    const tr = view.state.tr
    const state = createChainableState({
      state: view.state,
      transaction: tr,
    })
    const range = {
      from: from - (match[0].length - text.length),
      to,
    }

    rule.handler({
      state,
      range,
      match,
    })

    // stop if there are no changes
    if (!tr.steps.length) {
      return
    }

    // store transform as meta data
    // so we can undo input rules within the `undoInputRules` command
    tr.setMeta(plugin, {
      transform: tr,
      from,
      to,
      text,
    })

    view.dispatch(tr)
    matched = true
  })

  return matched
}

/**
 * Create an input rules plugin. When enabled, it will cause text
 * input that matches any of the given rules to trigger the rule’s
 * action.
 */
export function inputRulesPlugin(rules: InputRule[]): Plugin {
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

      // add support for input rules to trigger on enter
      // this is useful for example for code blocks
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
