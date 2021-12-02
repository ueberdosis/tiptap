import {
  Mark,
  markPasteRule,
  mergeAttributes,
  getMarksBetween,
  getMarkRange,
  findChildrenInRange,
} from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { find, test } from 'linkifyjs'
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
          key: new PluginKey('autolink'),
          appendTransaction: (transactions, oldState, newState) => {
            // TODO: prevent on undo history
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
                .filter(item => item.mark.type === this.type)
                .forEach(oldMark => {
                  const newFrom = mapping.map(oldMark.from)
                  const newTo = mapping.map(oldMark.to)
                  const newMarks = getMarksBetween(newFrom, newTo, newState.doc)
                    .filter(item => item.mark.type === this.type)

                  if (!newMarks.length) {
                    return
                  }

                  const newMark = newMarks[0]
                  const oldLinkText = oldState.doc.textBetween(oldMark.from, oldMark.to)
                  const newLinkText = newState.doc.textBetween(newMark.from, newMark.to)
                  const wasLink = test(oldLinkText)
                  const isLink = test(newLinkText)

                  // remove only the link, if it was a link before too
                  // because we don’t want to remove links that were set manually
                  if (wasLink && !isLink) {
                    tr.removeMark(newMark.from, newMark.to, this.type)
                  }
                })

              // now let’s see if we can add new links
              findChildrenInRange(newState.doc, newRange, node => node.isTextblock)
                .forEach(textBlock => {
                  find(textBlock.node.textContent)
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
                      tr.addMark(link.from, link.to, this.type.create({
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
        }),
      )
    }

    return plugins
  },
})
