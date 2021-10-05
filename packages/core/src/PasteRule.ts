import { EditorState, Plugin, Transaction } from 'prosemirror-state'
import { Fragment } from 'prosemirror-model'
import createChainableState from './helpers/createChainableState'

export type PasteRuleMatch = {
  index: number,
  text: string,
  replaceWith?: string,
  match?: RegExpMatchArray,
  [key: string]: any,
}

export class PasteRule {
  match: RegExp | ((text: string) => PasteRuleMatch[])

  handler: (props: {
    state: EditorState,
    start: number,
    end: number,
    match: PasteRuleMatch,
  }) => void

  constructor(
    match: RegExp | ((text: string) => PasteRuleMatch[]),
    handler: (props: {
      // fragment: Fragment,
      state: EditorState,
      start: number,
      end: number,
      match: PasteRuleMatch,
    }) => void,
  ) {
    this.match = match
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

const MAX_MATCH = 500

function run(config: {
  state: EditorState,
  text: string,
  from: number,
  to: number,
  rules: PasteRule[],
  plugin: Plugin,
}): any {
  const {
    state,
    from,
    text,
    to,
    rules,
    plugin,
  } = config

  console.log({
    state,
    from,
    text,
    to,
    rules,
    plugin,
  })

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
        [...textBefore.matchAll(rule.match)]
          .forEach(match => {
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

      console.log('appendTransaction')

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
        text: '',
        rules,
        plugin,
      })

      // state.doc.nodesBetween(from, to.b, (node, pos, parent) => {
      //   if (node.isTextblock) {
      //     console.log({ node, pos, parent })

      //     // tr.insertText('joo')
      //   }
      // })

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
