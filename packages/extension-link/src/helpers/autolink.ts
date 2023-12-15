import {
  combineTransactionSteps,
  findChildrenInRange,
  getChangedRanges,
  getMarksBetween,
  NodeWithPos,
} from '@tiptap/core'
import { MarkType } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { find, test } from 'linkifyjs'

type AutolinkOptions = {
  type: MarkType
  validate?: (url: string) => boolean
}

export function autolink(options: AutolinkOptions): Plugin {
  return new Plugin({
    key: new PluginKey('autolink'),
    appendTransaction: (transactions, oldState, newState) => {
      const docChanges = transactions.some(transaction => transaction.docChanged) && !oldState.doc.eq(newState.doc)
      const preventAutolink = transactions.some(transaction => transaction.getMeta('preventAutolink'))

      if (!docChanges || preventAutolink) {
        return
      }

      const { tr } = newState
      const transform = combineTransactionSteps(oldState.doc, [...transactions])
      const changes = getChangedRanges(transform)

      changes.forEach(({ oldRange, newRange }) => {
        // at first we check if we have to remove links
        getMarksBetween(oldRange.from, oldRange.to, oldState.doc)
          .filter(item => item.mark.type === options.type)
          .forEach(oldMark => {
            const newFrom = transform.mapping.map(oldMark.from)
            const newTo = transform.mapping.map(oldMark.to)
            const newMarks = getMarksBetween(newFrom, newTo, newState.doc).filter(
              item => item.mark.type === options.type,
            )

            if (!newMarks.length) {
              return
            }

            const newMark = newMarks[0]
            const oldLinkText = oldState.doc.textBetween(oldMark.from, oldMark.to, undefined, ' ')
            const newLinkText = newState.doc.textBetween(newMark.from, newMark.to, undefined, ' ')
            const wasLink = test(oldLinkText)
            const isLink = test(newLinkText)

            // remove only the link, if it was a link before too
            // because we don’t want to remove links that were set manually
            if (wasLink && !isLink) {
              tr.removeMark(newMark.from, newMark.to, options.type)
            }
          })

        // now let’s see if we can add new links
        const nodesInChangedRanges = findChildrenInRange(
          newState.doc,
          newRange,
          node => node.isTextblock,
        )

        let textBlock: NodeWithPos | undefined
        let textBeforeWhitespace: string | undefined

        if (nodesInChangedRanges.length > 0) {
          // Grab the first node within the changed ranges (ex. the first of two paragraphs when hitting enter).
          textBlock = nodesInChangedRanges[0]
          textBeforeWhitespace = newState.doc.textBetween(
            textBlock.pos,
            textBlock.pos + textBlock.node.nodeSize,
            undefined,
            ' ',
          )
        } else if (
          nodesInChangedRanges.length
          // We want to make sure to include the block seperator argument to treat hard breaks like spaces.
          && newState.doc.textBetween(newRange.from, newRange.to, ' ', ' ').endsWith(' ')
        ) {
          textBlock = nodesInChangedRanges[0]
          textBeforeWhitespace = newState.doc.textBetween(
            textBlock.pos,
            newRange.to,
            undefined,
            ' ',
          )
        }

        if (textBlock && textBeforeWhitespace) {
          const words = textBeforeWhitespace.split(' ')

          const wordsMap: Array<{
            word: string
            from: number
            to: number
            link?: ReturnType<typeof find>[0]
          }> = []

          words.forEach((word, index) => {
            if (!textBlock) {
              return
            }

            const prevWord = wordsMap[index - 1]

            const from = prevWord ? prevWord.to + 1 : textBlock.pos + 1
            const to = from + word.length

            const link = find(word)[0]

            wordsMap.push({
              word,
              from,
              to,
              link,
            })
          })

          wordsMap.forEach(word => {
            if (!word.link || !word.link.isLink) {
              return
            }

            // check if word is already a link mark
            const isLinkMark = getMarksBetween(word.from, word.to, newState.doc).some(mark => mark.mark.type === options.type)

            // remove mark if it is already a link
            if (isLinkMark) {
              tr.removeMark(word.from, word.to, options.type)
            }

            tr.addMark(
              word.from,
              word.to,
              options.type.create({
                href: word.link.href,
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
