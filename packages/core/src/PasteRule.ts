import { EditorState, Plugin } from 'prosemirror-state'
import createChainableState from './helpers/createChainableState'

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

export type PasteRuleMatcher = RegExp | ((text: string) => PasteRuleMatch[])

export class PasteRule {
  matcher: PasteRuleMatcher

  handler: (props: {
    state: EditorState,
    start: number,
    end: number,
    match: ExtendedRegExpMatchArray,
  }) => void

  constructor(
    matcher: PasteRuleMatcher,
    handler: (props: {
      state: EditorState,
      start: number,
      end: number,
      match: ExtendedRegExpMatchArray,
    }) => void,
  ) {
    this.matcher = matcher
    this.handler = handler
  }
}

// export class PasteRule {
//   match: RegExp | ((text: string) => PasteRuleMatch[])

//   handler: (props: {
//     fragment: Fragment
//     match: PasteRuleMatch,
//   }) => Fragment

//   constructor(config: {
//     match: RegExp | ((text: string) => PasteRuleMatch[]),
//     handler: (props: {
//       fragment: Fragment
//       match: PasteRuleMatch,
//     }) => Fragment,
//   }) {
//     this.match = config.match
//     this.handler = config.handler
//   }
// }

const pasteRuleMatchHandler = (
  text: string,
  match: RegExp | ((text: string) => PasteRuleMatch[]),
): RegExpMatchArray[] => {
  if (typeof match !== 'function') {
    return [...text.matchAll(match)]
  }

  return match(text).map(pasteRuleMatch => {
    const result: RegExpMatchArray = []
    const keys = Object.keys(pasteRuleMatch)
    const customKeys = keys.filter(key => !['index', 'text', 'replaceWith'].includes(key))

    result.push(pasteRuleMatch.text)

    if (pasteRuleMatch.replaceWith) {
      if (!pasteRuleMatch.text.includes(pasteRuleMatch.replaceWith)) {
        console.warn('[tiptap warn]: "pasteRuleMatch.replaceWith" has to be part of "pasteRuleMatch.text".')
      }

      result.push(pasteRuleMatch.replaceWith)
    }

    result.index = pasteRuleMatch.index
    result.input = text

    customKeys.forEach(key => {
      // @ts-ignore
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
    // plugin,
  } = config

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.isTextblock && !node.type.spec.code) {
      const resolvedFrom = Math.max(from, pos)
      const resolvedTo = Math.min(to, pos + node.content.size)
      const textBefore = node.textBetween(
        resolvedFrom,
        resolvedTo,
        undefined,
        '\ufffc',
      )

      rules.forEach(rule => {
        const matches = pasteRuleMatchHandler(textBefore, rule.matcher)

        matches.forEach(match => {
          if (match.index === undefined) {
            return
          }

          const tr = state.tr
          const start = resolvedFrom + match.index + 1
          const end = start + match[0].length

          rule.handler({
            state,
            start: tr.mapping.map(start),
            end: tr.mapping.map(end),
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
