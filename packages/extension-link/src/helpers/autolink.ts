import {
  getMarksBetween,
  findChildrenInRange,
  combineTransactionSteps,
  getChangedRanges,
} from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { MarkType } from 'prosemirror-model'
import { find, test } from 'linkifyjs'

type AutolinkOptions = {
  type: MarkType,
}

export default function autolink(options: AutolinkOptions): Plugin {
  return new Plugin({
    key: new PluginKey('autolink'),
    appendTransaction: (transactions, oldState, newState) => {
      const docChanges = transactions.some(transaction => transaction.docChanged)
        && !oldState.doc.eq(newState.doc)

      if (!docChanges) {
        return
      }

      const { tr } = newState
      const transform = combineTransactionSteps(oldState.doc, transactions)
      const { mapping } = transform
      const changes = getChangedRanges(transform)

      changes.forEach(({ oldRange, newRange }) => {
        // at first we check if we have to remove links
        getMarksBetween(oldRange.from, oldRange.to, oldState.doc)
          .filter(item => item.mark.type === options.type)
          .forEach(oldMark => {
            const newFrom = mapping.map(oldMark.from)
            const newTo = mapping.map(oldMark.to)
            const newMarks = getMarksBetween(newFrom, newTo, newState.doc)
              .filter(item => item.mark.type === options.type)

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
        findChildrenInRange(newState.doc, newRange, node => node.isTextblock)
          .forEach(textBlock => {
            // we need to define a placeholder for leaf nodes
            // so that the link position can be calculated correctly
            const text = newState.doc.textBetween(
              textBlock.pos,
              textBlock.pos + textBlock.node.nodeSize,
              undefined,
              ' ',
            )

            find(text)
              .filter(link => link.isLink)
              // calculate link position
              .map(link => ({
                ...link,
                from: textBlock.pos + link.start + 1,
                to: textBlock.pos + link.end + 1,
              }))
              // check if link is within the changed range
              .filter(link => {
                const fromIsInRange = newRange.from >= link.from && newRange.from <= link.to
                const toIsInRange = newRange.to >= link.from && newRange.to <= link.to

                return fromIsInRange || toIsInRange
              })
              // add link mark
              .forEach(link => {
                tr.addMark(link.from, link.to, options.type.create({
                  href: link.href,
                }))
              })
          })
      })

      if (!tr.steps.length) {
        return
      }

      return tr
    },
  })
}
