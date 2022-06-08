import { Mark, markPasteRule, mergeAttributes } from '@tiptap/core'
import { find, registerCustomProtocol } from 'linkifyjs'

import { autolink } from './helpers/autolink'
import { clickHandler } from './helpers/clickHandler'
import { pasteHandler } from './helpers/pasteHandler'

export interface LinkOptions {
  /**
   * If enabled, it adds links as you type.
   */
  autolink: boolean,
  /**
   * An array of custom protocols to be registered with linkifyjs.
   */
  protocols: Array<string>,
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
  /**
   * A validation function that modifies link verification for the auto linker.
   * @param url - The url to be validated.
   * @returns - True if the url is valid, false otherwise.
   */
  validate?: (url: string) => boolean,
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

  onCreate() {
    this.options.protocols.forEach(registerCustomProtocol)
  },

  inclusive() {
    return this.options.autolink
  },

  addOptions() {
    return {
      openOnClick: true,
      linkOnPaste: true,
      autolink: true,
      protocols: [],
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
        class: null,
      },
      validate: undefined,
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
      class: {
        default: this.options.HTMLAttributes.class,
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'a[href]:not([href *= "javascript:" i])' },
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
      setLink: attributes => ({ chain }) => {
        return chain()
          .setMark(this.name, attributes)
          .setMeta('preventAutolink', true)
          .run()
      },

      toggleLink: attributes => ({ chain }) => {
        return chain()
          .toggleMark(this.name, attributes, { extendEmptyMarkRange: true })
          .setMeta('preventAutolink', true)
          .run()
      },

      unsetLink: () => ({ chain }) => {
        return chain()
          .unsetMark(this.name, { extendEmptyMarkRange: true })
          .setMeta('preventAutolink', true)
          .run()
      },
    }
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: text => find(text)
          .filter(link => {
            if (this.options.validate) {
              return this.options.validate(link.value)
            }

            return true
          })
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
        validate: this.options.validate,
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
