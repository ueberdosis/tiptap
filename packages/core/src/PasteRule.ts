import { EditorState, Plugin } from 'prosemirror-state'
import createChainableState from './helpers/createChainableState'
import { Range } from './types'

export type PasteRuleMatch = {
  index: number,
  text: string,
  replaceWith?: string,
  match?: RegExpMatchArray,
  [key: string]: any,
}

export type ExtendedRegExpMatchArray = RegExpMatchArray & {
  [key: string]: any,
}

export type PasteRuleMatcher =
  | RegExp
  | ((text: string) => PasteRuleMatch[])

export class PasteRule {
  matcher: PasteRuleMatcher

  handler: (props: {
    state: EditorState,
    range: Range,
    match: ExtendedRegExpMatchArray,
  }) => void

  constructor(config: {
    matcher: PasteRuleMatcher,
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

const pasteRuleMatcherHandler = (text: string, matcher: PasteRuleMatcher): ExtendedRegExpMatchArray[] => {
  if (typeof matcher !== 'function') {
    return [...text.matchAll(matcher)]
  }

  return matcher(text).map(pasteRuleMatch => {
    const result: ExtendedRegExpMatchArray = []

    result.push(pasteRuleMatch.text)
    result.index = pasteRuleMatch.index
    result.input = text

    if (pasteRuleMatch.replaceWith) {
      if (!pasteRuleMatch.text.includes(pasteRuleMatch.replaceWith)) {
        console.warn('[tiptap warn]: "pasteRuleMatch.replaceWith" has to be part of "pasteRuleMatch.text".')
      }

      result.push(pasteRuleMatch.replaceWith)
    }

    Object
      .keys(pasteRuleMatch)
      .filter(key => !['index', 'text', 'replaceWith'].includes(key))
      .forEach(key => {
        result[key] = pasteRuleMatch[key]
      })

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
    if (node.isTextblock && !node.type.spec.code) {
      const resolvedFrom = Math.max(from, pos)
      const resolvedTo = Math.min(to, pos + node.content.size)
      const matchedText = node.textBetween(
        resolvedFrom - pos,
        resolvedTo - pos,
        undefined,
        '\ufffc',
      )

      rules.forEach(rule => {
        const matches = pasteRuleMatcherHandler(matchedText, rule.matcher)

        matches.forEach(match => {
          if (match.index === undefined) {
            return
          }

          const start = resolvedFrom + match.index + 1
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
    }
  })
}

export function pasteRules(config: { rules: PasteRule[] }): Plugin {
  const { rules } = config

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
