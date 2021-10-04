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
    fragment: Fragment
    match: PasteRuleMatch,
  }) => Fragment

  constructor(
    match: RegExp | ((text: string) => PasteRuleMatch[]),
    handler: (props: {
      fragment: Fragment
      match: PasteRuleMatch,
    }) => Fragment,
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

function run(config: {
  state: EditorState,
  from: number,
  to: number,
  rules: PasteRule[],
  plugin: Plugin,
}): any {

  console.log({ config })

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
      if (tr.steps.length) {
        return
      }

      return tr
    },

    // @ts-ignore
    isPasteRules: true,
  })

  return plugin
}
