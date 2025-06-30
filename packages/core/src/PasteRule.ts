import { Fragment, Node as ProseMirrorNode } from '@tiptap/pm/model'
import { EditorState, Plugin } from '@tiptap/pm/state'

import { CommandManager } from './CommandManager.js'
import { Editor } from './Editor.js'
import { createChainableState } from './helpers/createChainableState.js'
import { getHTMLFromFragment } from './helpers/getHTMLFromFragment.js'
import {
  CanCommands,
  ChainedCommands,
  ExtendedRegExpMatchArray,
  Range,
  SingleCommands,
} from './types.js'
import { isNumber } from './utilities/isNumber.js'
import { isRegExp } from './utilities/isRegExp.js'

export type PasteRuleMatch = {
  index: number;
  text: string;
  replaceWith?: string;
  match?: RegExpMatchArray;
  data?: Record<string, any>;
};

export type PasteRuleFinder =
  | RegExp
  | ((text: string, event?: ClipboardEvent | null) => PasteRuleMatch[] | null | undefined);

/**
 * Paste rules are used to react to pasted content.
 * @see https://tiptap.dev/docs/editor/extensions/custom-extensions/extend-existing#paste-rules
 */
export class PasteRule {
  find: PasteRuleFinder

  handler: (props: {
    state: EditorState;
    range: Range;
    match: ExtendedRegExpMatchArray;
    commands: SingleCommands;
    chain: () => ChainedCommands;
    can: () => CanCommands;
    pasteEvent: ClipboardEvent | null;
    dropEvent: DragEvent | null;
  }) => void | null

  constructor(config: {
    find: PasteRuleFinder;
    handler: (props: {
      can: () => CanCommands;
      chain: () => ChainedCommands;
      commands: SingleCommands;
      dropEvent: DragEvent | null;
      match: ExtendedRegExpMatchArray;
      pasteEvent: ClipboardEvent | null;
      range: Range;
      state: EditorState;
    }) => void | null;
  }) {
    this.find = config.find
    this.handler = config.handler
  }
}

const pasteRuleMatcherHandler = (
  text: string,
  find: PasteRuleFinder,
  event?: ClipboardEvent | null,
): ExtendedRegExpMatchArray[] => {
  if (isRegExp(find)) {
    return [...text.matchAll(find)]
  }

  const matches = find(text, event)

  if (!matches) {
    return []
  }

  return matches.map(pasteRuleMatch => {
    const result: ExtendedRegExpMatchArray = [pasteRuleMatch.text]

    result.index = pasteRuleMatch.index
    result.input = text
    result.data = pasteRuleMatch.data

    if (pasteRuleMatch.replaceWith) {
      if (!pasteRuleMatch.text.includes(pasteRuleMatch.replaceWith)) {
        console.warn(
          '[tiptap warn]: "pasteRuleMatch.replaceWith" must be part of "pasteRuleMatch.text".',
        )
      }

      result.push(pasteRuleMatch.replaceWith)
    }

    return result
  })
}

function run(config: {
  editor: Editor;
  state: EditorState;
  from: number;
  to: number;
  rule: PasteRule;
  pasteEvent: ClipboardEvent | null;
  dropEvent: DragEvent | null;
}): boolean {
  const {
    editor, state, from, to, rule, pasteEvent, dropEvent,
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
    const textToMatch = node.textBetween(resolvedFrom - pos, resolvedTo - pos, undefined, '\ufffc')

    const matches = pasteRuleMatcherHandler(textToMatch, rule.find, pasteEvent)

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
        pasteEvent,
        dropEvent,
      })

      handlers.push(handler)
    })
  })

  const success = handlers.every(handler => handler !== null)

  return success
}

// When dragging across editors, must get another editor instance to delete selection content.
let tiptapDragFromOtherEditor: Editor | null = null

const createClipboardPasteEvent = (text: string) => {
  const event = new ClipboardEvent('paste', {
    clipboardData: new DataTransfer(),
  })

  event.clipboardData?.setData('text/html', text)

  return event
}

/**
 * Create an paste rules plugin. When enabled, it will cause pasted
 * text that matches any of the given rules to trigger the rule’s
 * action.
 */
export function pasteRulesPlugin(props: { editor: Editor; rules: PasteRule[] }): Plugin[] {
  const { editor, rules } = props
  let dragSourceElement: Element | null = null
  let isPastedFromProseMirror = false
  let isDroppedFromProseMirror = false
  let pasteEvent = typeof ClipboardEvent !== 'undefined' ? new ClipboardEvent('paste') : null
  let dropEvent: DragEvent | null

  try {
    dropEvent = typeof DragEvent !== 'undefined' ? new DragEvent('drop') : null
  } catch {
    dropEvent = null
  }

  const processEvent = ({
    state,
    from,
    to,
    rule,
    pasteEvt,
  }: {
    state: EditorState;
    from: number;
    to: { b: number };
    rule: PasteRule;
    pasteEvt: ClipboardEvent | null;
  }) => {
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
      pasteEvent: pasteEvt,
      dropEvent,
    })

    if (!handler || !tr.steps.length) {
      return
    }

    try {
      dropEvent = typeof DragEvent !== 'undefined' ? new DragEvent('drop') : null
    } catch {
      dropEvent = null
    }
    pasteEvent = typeof ClipboardEvent !== 'undefined' ? new ClipboardEvent('paste') : null

    return tr
  }

  const plugins = rules.map(rule => {
    return new Plugin({
      // we register a global drag handler to track the current drag source element
      view(view) {
        const handleDragstart = (event: DragEvent) => {
          dragSourceElement = view.dom.parentElement?.contains(event.target as Element)
            ? view.dom.parentElement
            : null

          if (dragSourceElement) {
            tiptapDragFromOtherEditor = editor
          }
        }

        const handleDragend = () => {
          if (tiptapDragFromOtherEditor) {
            tiptapDragFromOtherEditor = null
          }
        }

        window.addEventListener('dragstart', handleDragstart)
        window.addEventListener('dragend', handleDragend)

        return {
          destroy() {
            window.removeEventListener('dragstart', handleDragstart)
            window.removeEventListener('dragend', handleDragend)
          },
        }
      },

      props: {
        handleDOMEvents: {
          drop: (view, event: Event) => {
            isDroppedFromProseMirror = dragSourceElement === view.dom.parentElement
            dropEvent = event as DragEvent

            if (!isDroppedFromProseMirror) {
              const dragFromOtherEditor = tiptapDragFromOtherEditor

              if (dragFromOtherEditor?.isEditable) {
                // setTimeout to avoid the wrong content after drop, timeout arg can't be empty or 0
                setTimeout(() => {
                  const selection = dragFromOtherEditor.state.selection

                  if (selection) {
                    dragFromOtherEditor.commands.deleteRange({ from: selection.from, to: selection.to })
                  }
                }, 10)
              }
            }
            return false
          },

          paste: (_view, event: Event) => {
            const html = (event as ClipboardEvent).clipboardData?.getData('text/html')

            pasteEvent = event as ClipboardEvent

            isPastedFromProseMirror = !!html?.includes('data-pm-slice')

            return false
          },
        },
      },

      appendTransaction: (transactions, oldState, state) => {
        const transaction = transactions[0]
        const isPaste = transaction.getMeta('uiEvent') === 'paste' && !isPastedFromProseMirror
        const isDrop = transaction.getMeta('uiEvent') === 'drop' && !isDroppedFromProseMirror

        // if PasteRule is triggered by insertContent()
        const simulatedPasteMeta = transaction.getMeta('applyPasteRules') as
          | undefined
          | { from: number; text: string | ProseMirrorNode | Fragment }
        const isSimulatedPaste = !!simulatedPasteMeta

        if (!isPaste && !isDrop && !isSimulatedPaste) {
          return
        }

        // Handle simulated paste
        if (isSimulatedPaste) {
          let { text } = simulatedPasteMeta

          if (typeof text === 'string') {
            text = text as string
          } else {
            text = getHTMLFromFragment(Fragment.from(text), state.schema)
          }

          const { from } = simulatedPasteMeta
          const to = from + text.length

          const pasteEvt = createClipboardPasteEvent(text)

          return processEvent({
            rule,
            state,
            from,
            to: { b: to },
            pasteEvt,
          })
        }

        // handle actual paste/drop
        const from = oldState.doc.content.findDiffStart(state.doc.content)
        const to = oldState.doc.content.findDiffEnd(state.doc.content)

        // stop if there is no changed range
        if (!isNumber(from) || !to || from === to.b) {
          return
        }

        return processEvent({
          rule,
          state,
          from,
          to,
          pasteEvt: pasteEvent,
        })
      },
    })
  })

  return plugins
}
