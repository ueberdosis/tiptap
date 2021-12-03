import { Mark, markPasteRule, mergeAttributes } from '@tiptap/core'
import { find } from 'linkifyjs'
import autolink from './helpers/autolink'
import clickHandler from './helpers/clickHandler'
import pasteHandler from './helpers/pasteHandler'

export interface LinkOptions {
  /**
   * If enabled, it adds links as you type.
   */
  autolink: boolean,
  /**
   * If enabled, links will be opened on click.
   */
  openOnClick: boolean,
  /**
   * Adds a link to the current selection if the pasted content only contains an url.
   */
  linkOnPaste: boolean,
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

  keepOnSplit: false,

  inclusive() {
    return this.options.autolink
  },

  addOptions() {
    return {
      openOnClick: true,
      linkOnPaste: true,
      autolink: true,
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
    return [
      'a',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ]
  },

  addCommands() {
    return {
      setLink: attributes => ({ commands }) => {
        return commands.setMark(this.name, attributes)
      },

      toggleLink: attributes => ({ commands }) => {
        return commands.toggleMark(this.name, attributes, { extendEmptyMarkRange: true })
      },

      unsetLink: () => ({ commands }) => {
        return commands.unsetMark(this.name, { extendEmptyMarkRange: true })
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

    if (this.options.autolink) {
      plugins.push(autolink({
        type: this.type,
      }))
    }

    if (this.options.openOnClick) {
      plugins.push(clickHandler({
        type: this.type,
      }))
    }

    if (this.options.linkOnPaste) {
      plugins.push(pasteHandler({
        editor: this.editor,
        type: this.type,
      }))
    }

    return plugins
  },
})
