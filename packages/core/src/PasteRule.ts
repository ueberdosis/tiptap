import { EditorState, Plugin } from 'prosemirror-state'
import createChainableState from './helpers/createChainableState'
import isRegExp from './utilities/isRegExp'
import { Range, ExtendedRegExpMatchArray } from './types'

export type PasteRuleMatch = {
  index: number,
  text: string,
  replaceWith?: string,
  match?: RegExpMatchArray,
  data?: Record<string, any>,
}

export type PasteRuleFinder =
  | RegExp
  | ((text: string) => PasteRuleMatch[] | null | undefined)

export class PasteRule {
  find: PasteRuleFinder

  handler: (props: {
    state: EditorState,
    range: Range,
    match: ExtendedRegExpMatchArray,
  }) => void

  constructor(config: {
    find: PasteRuleFinder,
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

const pasteRuleMatcherHandler = (text: string, find: PasteRuleFinder): ExtendedRegExpMatchArray[] => {
  if (isRegExp(find)) {
    return [...text.matchAll(find)]
  }

  const matches = find(text)

  if (!matches) {
    return []
  }

  return matches.map(pasteRuleMatch => {
    const result: ExtendedRegExpMatchArray = []

    result.push(pasteRuleMatch.text)
    result.index = pasteRuleMatch.index
    result.input = text
    result.data = pasteRuleMatch.data

    if (pasteRuleMatch.replaceWith) {
      if (!pasteRuleMatch.text.includes(pasteRuleMatch.replaceWith)) {
        console.warn('[tiptap warn]: "pasteRuleMatch.replaceWith" must be part of "pasteRuleMatch.text".')
      }

      result.push(pasteRuleMatch.replaceWith)
    }

    return result
  })
}

function run(config: {
  state: EditorState,
  from: number,
  to: number,
  rules: PasteRule[],
  plugin: Plugin,
}): any {
  const {
    state,
    from,
    to,
    rules,
  } = config

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isTextblock || node.type.spec.code) {
      return
    }

    const resolvedFrom = Math.max(from, pos)
    const resolvedTo = Math.min(to, pos + node.content.size)
    const textToMatch = node.textBetween(
      resolvedFrom - pos,
      resolvedTo - pos,
      undefined,
      '\ufffc',
    )

    rules.forEach(rule => {
      const matches = pasteRuleMatcherHandler(textToMatch, rule.find)

      matches.forEach(match => {
        if (match.index === undefined) {
          return
        }

        const start = resolvedFrom + match.index
        const end = start + match[0].length
        const range = {
          from: state.tr.mapping.map(start),
          to: state.tr.mapping.map(end),
        }

        rule.handler({
          state,
          range,
          match,
        })
      })
    })
  }, from)
}

/**
 * Create an paste rules plugin. When enabled, it will cause pasted
 * text that matches any of the given rules to trigger the rule’s
 * action.
 */
export function pasteRulesPlugin(rules: PasteRule[]): Plugin {
  const plugin = new Plugin({
    appendTransaction: (transactions, oldState, state) => {
      const transaction = transactions[0]

      // stop if there is not a paste event
      if (!transaction.getMeta('paste')) {
        return
      }

      // stop if there is no changed range
      const { doc, before } = transaction
      const from = before.content.findDiffStart(doc.content)
      const to = before.content.findDiffEnd(doc.content)

      if (!from || !to) {
        return
      }

      // build a chainable state
      // so we can use a single transaction for all paste rules
      const tr = state.tr
      const chainableState = createChainableState({
        state,
        transaction: tr,
      })

      run({
        state: chainableState,
        from,
        to: to.b,
        rules,
        plugin,
      })

      // stop if there are no changes
      if (!tr.steps.length) {
        return
      }

      return tr
    },

    // @ts-ignore
    isPasteRules: true,
  })

  return plugin
}
