import { EditorState, Plugin } from 'prosemirror-state'

import { CommandManager } from './CommandManager'
import { Editor } from './Editor'
import { createChainableState } from './helpers/createChainableState'
import {
  CanCommands,
  ChainedCommands,
  ExtendedRegExpMatchArray,
  Range,
  SingleCommands,
} from './types'
import { isNumber } from './utilities/isNumber'
import { isRegExp } from './utilities/isRegExp'

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
  }) => void | null

  constructor(config: {
    find: PasteRuleFinder,
    handler: (props: {
      state: EditorState,
      range: Range,
      match: ExtendedRegExpMatchArray,
      commands: SingleCommands,
      chain: () => ChainedCommands,
      can: () => CanCommands,
    }) => void | null,
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
  rule: PasteRule,
}): boolean {
  const {
    editor,
    state,
    from,
    to,
    rule,
  } = config

  const { commands, chain, can } = new CommandManager({
    editor,
    state,
  })

  const handlers: (void | null)[] = []

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

      const handler = rule.handler({
        state,
        range,
        match,
        commands,
        chain,
        can,
      })

      handlers.push(handler)
    })
  })

  const success = handlers.every(handler => handler !== null)

  return success
}

/**
 * Create an paste rules plugin. When enabled, it will cause pasted
 * text that matches any of the given rules to trigger the rule’s
 * action.
 */
export function pasteRulesPlugin(props: { editor: Editor, rules: PasteRule[] }): Plugin[] {
  const { editor, rules } = props
  let dragSourceElement: Element | null = null
  let draggedElement: any
  let draggedText: Selection | null = null
  let caretOffset: number | undefined
  let isPastedFromProseMirror = false
  let isDroppedFromProseMirror = false

  const plugins = rules.map(rule => {
    return new Plugin({
      // we register a global drag handler to track the current drag source element
      view(view) {
        const handleDragstart = (event: DragEvent) => {
          draggedElement = event.target
          draggedText = window.getSelection()
          event.dataTransfer?.setData('text/plain', draggedText?.toString() as string)
          dragSourceElement = view.dom.parentElement?.contains(event.target as Element)
            ? view.dom.parentElement
            : null
        }

        const handleDragEnter = (event: DragEvent) => {
          event.preventDefault()
        }

        const handleDragOver = (event: DragEvent) => {
          event.preventDefault()
          let caretData

          if (document.caretRangeFromPoint) {
            caretData = document.caretRangeFromPoint(event.clientX, event.clientY)
          }
          caretOffset = caretData?.startOffset
        }

        window.addEventListener('dragstart', handleDragstart)

        window.addEventListener('dragenter', handleDragEnter)

        window.addEventListener('dragover', handleDragOver)

        return {
          destroy() {
            window.removeEventListener('dragstart', handleDragstart)
            window.removeEventListener('dragenter', handleDragEnter)
            window.removeEventListener('dragover', handleDragOver)
          },
        }
      },

      props: {
        handleDOMEvents: {
          drop: (view, event: any) => {
            isDroppedFromProseMirror = dragSourceElement === view.dom.parentElement
            event.preventDefault()

            const data = event.dataTransfer?.getData('text/plain')

            if (event.target.parentElement.className === 'ProseMirror') {
              draggedElement.textContent = draggedElement.textContent.replace(data, '')
              event.target.textContent = event.target.textContent.slice(0, caretOffset) + data + event.target.textContent.slice(caretOffset)
            }
            return false
          },

          paste: (view, event: Event) => {
            const html = (event as ClipboardEvent).clipboardData?.getData('text/html')

            isPastedFromProseMirror = !!html?.includes('data-pm-slice')

            return false
          },
        },
      },

      appendTransaction: (transactions, oldState, state) => {
        const transaction = transactions[0]
        const isPaste = transaction.getMeta('uiEvent') === 'paste' && !isPastedFromProseMirror
        const isDrop = transaction.getMeta('uiEvent') === 'drop' && !isDroppedFromProseMirror

        if (!isPaste && !isDrop) {
          return
        }

        // stop if there is no changed range
        const from = oldState.doc.content.findDiffStart(state.doc.content)
        const to = oldState.doc.content.findDiffEnd(state.doc.content)

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

        const handler = run({
          editor,
          state: chainableState,
          from: Math.max(from - 1, 0),
          to: to.b - 1,
          rule,
        })

        // stop if there are no changes
        if (!handler || !tr.steps.length) {
          return
        }

        return tr
      },
    })
  })

  return plugins
}
