import {
  combineTransactionSteps,
  findChildrenInRange,
  getChangedRanges,
  getMarksBetween,
  NodeWithPos,
} from '@tiptap/core'
import { MarkType } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { MultiToken, tokenize } from 'linkifyjs'

import { UNICODE_WHITESPACE_REGEX, UNICODE_WHITESPACE_REGEX_END } from './whitespace.js'

/**
 * Check if the provided tokens form a valid link structure, which can either be a single link token
 * or a link token surrounded by parentheses or square brackets.
 *
 * This ensures that only complete and valid text is hyperlinked, preventing cases where a valid
 * top-level domain (TLD) is immediately followed by an invalid character, like a number. For
 * example, with the `find` method from Linkify, entering `example.com1` would result in
 * `example.com` being linked and the trailing `1` left as plain text. By using the `tokenize`
 * method, we can perform more comprehensive validation on the input text.
 */
function isValidLinkStructure(tokens: Array<ReturnType<MultiToken['toObject']>>) {
  if (tokens.length === 1) {
    return tokens[0].isLink
  }

  if (tokens.length === 3 && tokens[1].isLink) {
    return ['()', '[]'].includes(tokens[0].value + tokens[2].value)
  }

  return false
}

type AutolinkOptions = {
  type: MarkType
  defaultProtocol: string
  validate: (url: string) => boolean
  shouldAutoLink: (url: string) => boolean
}

/**
 * This plugin allows you to automatically add links to your editor.
 * @param options The plugin options
 * @returns The plugin instance
 */
export function autolink(options: AutolinkOptions): Plugin {
  return new Plugin({
    key: new PluginKey('autolink'),
    appendTransaction: (transactions, oldState, newState) => {
      /**
       * Does the transaction change the document?
       */
      const docChanges = transactions.some(transaction => transaction.docChanged) && !oldState.doc.eq(newState.doc)

      /**
       * Prevent autolink if the transaction is not a document change or if the transaction has the meta `preventAutolink`.
       */
      const preventAutolink = transactions.some(transaction => transaction.getMeta('preventAutolink'))

      /**
       * Prevent autolink if the transaction is not a document change
       * or if the transaction has the meta `preventAutolink`.
       */
      if (!docChanges || preventAutolink) {
        return
      }

      const { tr } = newState
      const transform = combineTransactionSteps(oldState.doc, [...transactions])
      const changes = getChangedRanges(transform)

      changes.forEach(({ newRange }) => {
        // Now let’s see if we can add new links.
        const nodesInChangedRanges = findChildrenInRange(
          newState.doc,
          newRange,
          node => node.isTextblock,
        )

        let textBlock: NodeWithPos | undefined
        let textBeforeWhitespace: string | undefined

        if (nodesInChangedRanges.length > 1) {
          // Grab the first node within the changed ranges (ex. the first of two paragraphs when hitting enter).
          textBlock = nodesInChangedRanges[0]
          textBeforeWhitespace = newState.doc.textBetween(
            textBlock.pos,
            textBlock.pos + textBlock.node.nodeSize,
            undefined,
            ' ',
          )
        } else if (nodesInChangedRanges.length) {
          const endText = newState.doc.textBetween(newRange.from, newRange.to, ' ', ' ')

          if (!UNICODE_WHITESPACE_REGEX_END.test(endText)) {
            return
          }
          textBlock = nodesInChangedRanges[0]
          textBeforeWhitespace = newState.doc.textBetween(
            textBlock.pos,
            newRange.to,
            undefined,
            ' ',
          )
        }

        if (textBlock && textBeforeWhitespace) {
          const wordsBeforeWhitespace = textBeforeWhitespace.split(UNICODE_WHITESPACE_REGEX).filter(Boolean)

          if (wordsBeforeWhitespace.length <= 0) {
            return false
          }

          const lastWordBeforeSpace = wordsBeforeWhitespace[wordsBeforeWhitespace.length - 1]
          const lastWordAndBlockOffset = textBlock.pos + textBeforeWhitespace.lastIndexOf(lastWordBeforeSpace)

          if (!lastWordBeforeSpace) {
            return false
          }

          const linksBeforeSpace = tokenize(lastWordBeforeSpace).map(t => t.toObject(options.defaultProtocol))

          if (!isValidLinkStructure(linksBeforeSpace)) {
            return false
          }

          linksBeforeSpace
            .filter(link => link.isLink)
            // Calculate link position.
            .map(link => ({
              ...link,
              from: lastWordAndBlockOffset + link.start + 1,
              to: lastWordAndBlockOffset + link.end + 1,
            }))
            // ignore link inside code mark
            .filter(link => {
              if (!newState.schema.marks.code) {
                return true
              }

              return !newState.doc.rangeHasMark(
                link.from,
                link.to,
                newState.schema.marks.code,
              )
            })
            // validate link
            .filter(link => options.validate(link.value))
            // check whether should autolink
            .filter(link => options.shouldAutoLink(link.value))
            // Add link mark.
            .forEach(link => {
              if (getMarksBetween(link.from, link.to, newState.doc).some(item => item.mark.type === options.type)) {
                return
              }

              tr.addMark(
                link.from,
                link.to,
                options.type.create({
                  href: link.href,
                }),
              )
            })
        }
      })

      if (!tr.steps.length) {
        return
      }

      return tr
    },
  })
}
