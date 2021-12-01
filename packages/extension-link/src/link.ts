import {
  Mark,
  markPasteRule,
  mergeAttributes,
  getMarksBetween,
  getMarkRange,
  findChildrenInRange,
} from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { find } from 'linkifyjs'
import combineTransactionSteps from './helpers/combineTransactionSteps'
import getChangedRanges from './helpers/getChangedRanges'

export interface LinkOptions {
  /**
   * If enabled, links will be opened on click.
   */
  openOnClick: boolean,
  /**
   * Adds a link to the current selection if the pasted content only contains an url.
   */
  linkOnPaste: boolean,
  /**
   * autolink
   */
  autoLink: boolean,
  /**
   * A list of HTML attributes to be rendered.
   */
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    link: {
      /**
       * Set a link mark
       */
      setLink: (attributes: { href: string, target?: string }) => ReturnType,
      /**
       * Toggle a link mark
       */
      toggleLink: (attributes: { href: string, target?: string }) => ReturnType,
      /**
       * Unset a link mark
       */
      unsetLink: () => ReturnType,
    }
  }
}

export const Link = Mark.create<LinkOptions>({
  name: 'link',

  priority: 1000,

  // inclusive: false,

  inclusive() {
    return this.options.autoLink
  },

  addOptions() {
    return {
      openOnClick: true,
      linkOnPaste: true,
      autoLink: true,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
      },
    }
  },

  addAttributes() {
    return {
      href: {
        default: null,
      },
      target: {
        default: this.options.HTMLAttributes.target,
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'a[href]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setLink: attributes => ({ commands }) => {
        return commands.setMark('link', attributes)
      },
      toggleLink: attributes => ({ commands }) => {
        return commands.toggleMark('link', attributes, { extendEmptyMarkRange: true })
      },
      unsetLink: () => ({ commands }) => {
        return commands.unsetMark('link', { extendEmptyMarkRange: true })
      },
    }
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: text => find(text)
          .filter(link => link.isLink)
          .map(link => ({
            text: link.value,
            index: link.start,
            data: link,
          })),
        type: this.type,
        getAttributes: match => ({
          href: match.data?.href,
        }),
      }),
    ]
  },

  addProseMirrorPlugins() {
    const plugins = []

    if (this.options.openOnClick) {
      plugins.push(
        new Plugin({
          key: new PluginKey('handleClickLink'),
          props: {
            handleClick: (view, pos, event) => {
              const attrs = this.editor.getAttributes('link')
              const link = (event.target as HTMLElement)?.closest('a')

              if (link && attrs.href) {
                window.open(attrs.href, attrs.target)

                return true
              }

              return false
            },
          },
        }),
      )
    }

    if (this.options.linkOnPaste) {
      plugins.push(
        new Plugin({
          key: new PluginKey('handlePasteLink'),
          props: {
            handlePaste: (view, event, slice) => {
              const { state } = view
              const { selection } = state
              const { empty } = selection

              if (empty) {
                return false
              }

              let textContent = ''

              slice.content.forEach(node => {
                textContent += node.textContent
              })

              const link = find(textContent)
                .find(item => item.isLink && item.value === textContent)

              if (!textContent || !link) {
                return false
              }

              this.editor.commands.setMark(this.type, {
                href: link.href,
              })

              return true
            },
          },
        }),
      )
    }

    if (this.options.autoLink) {
      plugins.push(
        new Plugin({
          key: new PluginKey('handleClickLink'),
          appendTransaction: (transactions, oldState, newState) => {
            const docChanges = transactions.some(transaction => transaction.docChanged)
            && !oldState.doc.eq(newState.doc)

            if (!docChanges) {
              return
            }

            const { tr } = newState
            const transform = combineTransactionSteps(oldState.doc, transactions)
            const changes = getChangedRanges(transform)

            console.log({ changes })

            changes.forEach(range => {
              const $from = newState.doc.resolve(range.from)
              const $to = newState.doc.resolve(range.to)
              // const $pos2 = newState.doc.resolve(range.from - 1)

              const textBlocks = findChildrenInRange(newState.doc, range, node => node.isTextblock)

              const marks = getMarksBetween(range.from, range.to, newState)
                .filter(markRange => markRange.mark.type === this.type)

              console.log({
                // type: this.type,
                $from,
                $to,
                marks: getMarksBetween($from.before(), $to.after(), newState)
                  .filter(markRange => markRange.mark.type === this.type),
                oldMarks: getMarksBetween(range.from, range.to, newState)
                  .filter(markRange => markRange.mark.type === this.type),
                // $pos,
                // before: $pos.before(),
                // markRange: getMarkRange($pos, this.type),
                // markRange2: getMarkRange($pos2, this.type),
                // marks,
              })

              // console.log({ marks })

              // textBlocks.forEach(textBlock => {
              //   const links = find(textBlock.node.textContent).filter(link => link.isLink)

              //   links.forEach(link => {
              //     const from = textBlock.pos + link.start + 1
              //     const to = textBlock.pos + link.end + 1

              //     tr.addMark(from, to, this.type.create({
              //       href: link.href,
              //     }))
              //   })

              //   // console.log({ textBlock, links })
              // })

            })

            if (!tr.steps.length) {
              return
            }

            return tr
          },
        }),
      )
    }

    return plugins
  },
})
