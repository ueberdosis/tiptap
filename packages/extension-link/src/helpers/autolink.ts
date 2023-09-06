import {
  combineTransactionSteps,
  findChildrenInRange,
  getChangedRanges,
  getMarksBetween,
} from '@tiptap/core'
import { MarkType } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { find } from 'linkifyjs'

type AutolinkOptions = {
  type: MarkType;
  validate?: (url: string) => boolean;
}

type LinkType = {
  type: string;
  value: string;
  isLink: boolean;
  href: string;
  start: number;
  end: number;
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

      changes.forEach(({ newRange }) => {
        // Now let’s see if we can add new links.
        const nodesInChangedRanges = findChildrenInRange(
          newState.doc,
          newRange,
          node => node.isTextblock,
        )

        // Grab the first node within the changed ranges (ex. the first of two paragraphs when hitting enter).
        const textBlock = nodesInChangedRanges[0]

        if (!textBlock) {
          return
        }

        const textBeforeWhitespace = newState.doc.textBetween(
          textBlock.pos,
          newRange.to,
          ' ',
          ' ',
        )

        if (textBeforeWhitespace) {

          if (!/\s*\S+\s+$/gm.test(textBeforeWhitespace)) {
            return
          }

          const lastWordBeforeSpaceMatch = textBeforeWhitespace.matchAll(/\s*(\S+)\s+$/gm)
          const lastMatch = Array.from(lastWordBeforeSpaceMatch).at(-1)

          if (lastMatch === undefined || lastMatch.length < 2) {
            return
          }

          const lastWordBeforeSpace = lastMatch[1]
          const lastWordAndBlockOffset = textBlock.pos + textBeforeWhitespace.lastIndexOf(lastWordBeforeSpace)

          if (!lastWordBeforeSpace) {
            return false
          }

          find(lastWordBeforeSpace)
            .filter((link: LinkType) => link.isLink)
            // Calculate link position.
            .map((link: LinkType) => ({
              ...link,
              start: lastWordAndBlockOffset + link.start + 1,
              end: lastWordAndBlockOffset + link.end + 1,
            }))
            // ignore link inside code mark
            .filter((link: LinkType) => {
              if (!newState.schema.marks.code) {
                return true
              }

              return !newState.doc.rangeHasMark(
                link.start,
                link.end,
                newState.schema.marks.code,
              )
            })
            // validate link
            .filter(link => {
              if (options.validate) {
                return options.validate(link.value)
              }
              return true
            })
            // Add link mark.
            .forEach(link => {
              if (getMarksBetween(link.start, link.end, newState.doc).some(item => item.mark.type === options.type)) {
                return
              }

              tr.addMark(
                link.start,
                link.end,
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
