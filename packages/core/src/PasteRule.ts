import { EditorState, Plugin } from 'prosemirror-state'
import { Editor } from './Editor'
import { CommandManager } from './CommandManager'
import { createChainableState } from './helpers/createChainableState'
import { isRegExp } from './utilities/isRegExp'
import { isNumber } from './utilities/isNumber'
import {
  Range,
  ExtendedRegExpMatchArray,
  SingleCommands,
  ChainedCommands,
  CanCommands,
} from './types'

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
    commands: SingleCommands,
    chain: () => ChainedCommands,
    can: () => CanCommands,
  }) => void

  constructor(config: {
    find: PasteRuleFinder,
    handler: (props: {
      state: EditorState,
      range: Range,
      match: ExtendedRegExpMatchArray,
      commands: SingleCommands,
      chain: () => ChainedCommands,
      can: () => CanCommands,
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
  editor: Editor,
  state: EditorState,
  from: number,
  to: number,
  rules: PasteRule[],
  plugin: Plugin,
}): any {
  const {
    editor,
    state,
    from,
    to,
    rules,
  } = config

  const { commands, chain, can } = new CommandManager({
    editor,
    state,
  })

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
          commands,
          chain,
          can,
        })
      })
    })
  })
}

/**
 * Create an paste rules plugin. When enabled, it will cause pasted
 * text that matches any of the given rules to trigger the rule’s
 * action.
 */
export function pasteRulesPlugin(props: { editor: Editor, rules: PasteRule[] }): Plugin {
  const { editor, rules } = props
  let isProseMirrorHTML = false

  const plugin = new Plugin({
    props: {
      handlePaste: (view, event) => {
        const html = event.clipboardData?.getData('text/html')

        isProseMirrorHTML = !!html?.includes('data-pm-slice')

        return false
      },
    },
    appendTransaction: (transactions, oldState, state) => {
      const transaction = transactions[0]

      // stop if there is not a paste event
      if (!transaction.getMeta('paste') || isProseMirrorHTML) {
        return
      }

      // stop if there is no changed range
      const { doc, before } = transaction
      const from = before.content.findDiffStart(doc.content)
      const to = before.content.findDiffEnd(doc.content)

      if (!isNumber(from) || !to || from === to.b) {
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
        editor,
        state: chainableState,
        from: Math.max(from - 1, 0),
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
