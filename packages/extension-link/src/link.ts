import {
  Mark, markPasteRule, mergeAttributes, PasteRuleMatch,
} from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { find, registerCustomProtocol, reset } from 'linkifyjs'

import { autolink } from './helpers/autolink.js'
import { clickHandler } from './helpers/clickHandler.js'
import { pasteHandler } from './helpers/pasteHandler.js'

export interface LinkProtocolOptions {
  scheme: string;
  optionalSlashes?: boolean;
}

export const pasteRegex = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}\b(?:[-a-zA-Z0-9@:%._+~#=?!&/]*)(?:[-a-zA-Z0-9@:%._+~#=?!&/]*)/gi

export interface LinkOptions {
  /**
   * If enabled, it adds links as you type.
   */
  autolink: boolean
  /**
   * An array of custom protocols to be registered with linkifyjs.
   */
  protocols: Array<LinkProtocolOptions | string>
  /**
   * If enabled, links will be opened on click.
   */
  openOnClick: boolean
  /**
   * Adds a link to the current selection if the pasted content only contains an url.
   */
  linkOnPaste: boolean
  /**
   * A list of HTML attributes to be rendered.
   */
  HTMLAttributes: Record<string, any>
  /**
   * A validation function that modifies link verification for the auto linker.
   * @param url - The url to be validated.
   * @returns - True if the url is valid, false otherwise.
   */
  validate?: (url: string) => boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    link: {
      /**
       * Set a link mark
       */
      setLink: (attributes: { href: string; target?: string | null; rel?: string | null; class?: string | null }) => ReturnType
      /**
       * Toggle a link mark
       */
      toggleLink: (attributes: { href: string; target?: string | null; rel?: string | null; class?: string | null }) => ReturnType
      /**
       * Unset a link mark
       */
      unsetLink: () => ReturnType
    }
  }
}

export const Link = Mark.create<LinkOptions>({
  name: 'link',

  priority: 1000,

  keepOnSplit: false,

  onCreate() {
    this.options.protocols.forEach(protocol => {
      if (typeof protocol === 'string') {
        registerCustomProtocol(protocol)
        return
      }
      registerCustomProtocol(protocol.scheme, protocol.optionalSlashes)
    })
  },

  onDestroy() {
    reset()
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
      rel: {
        default: this.options.HTMLAttributes.rel,
      },
      class: {
        default: this.options.HTMLAttributes.class,
      },
    }
  },

  parseHTML() {
    return [{ tag: 'a[href]:not([href *= "javascript:" i])' }]
  },

  renderHTML({ HTMLAttributes }) {
    // False positive; we're explicitly checking for javascript: links to ignore them
    // eslint-disable-next-line no-script-url
    if (HTMLAttributes.href?.startsWith('javascript:')) {
      // strip out the href
      return ['a', mergeAttributes(this.options.HTMLAttributes, { ...HTMLAttributes, href: '' }), 0]
    }
    return ['a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setLink:
        attributes => ({ chain }) => {
          return chain().setMark(this.name, attributes).setMeta('preventAutolink', true).run()
        },

      toggleLink:
        attributes => ({ chain }) => {
          return chain()
            .toggleMark(this.name, attributes, { extendEmptyMarkRange: true })
            .setMeta('preventAutolink', true)
            .run()
        },

      unsetLink:
        () => ({ chain }) => {
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
        find: (text, event) => {
          const html = event?.clipboardData?.getData('text/html')

          const foundLinks: PasteRuleMatch[] = []

          if (html) {
            const dom = new DOMParser().parseFromString(html, 'text/html')
            const anchors = dom.querySelectorAll('a')

            if (anchors.length) {
              [...anchors].forEach(anchor => (foundLinks.push({
                text: anchor.innerText,
                data: {
                  href: anchor.getAttribute('href'),
                },
                // get the index of the anchor inside the text
                // and add the length of the anchor text
                index: dom.body.innerText.indexOf(anchor.innerText) + anchor.innerText.length,
              })))
            }
          }

          if (text) {
            const links = find(text).filter(item => item.isLink)

            if (links.length) {
              links.forEach(link => (foundLinks.push({
                text: link.value,
                data: {
                  href: link.href,
                },
                index: link.start,
              })))
            }
          }

          return foundLinks
        },
        type: this.type,
        getAttributes: match => {
          return {
            href: match.data?.href,
          }
        },
      }),
    ]
  },

  addProseMirrorPlugins() {
    const plugins: Plugin[] = []

    if (this.options.autolink) {
      plugins.push(
        autolink({
          type: this.type,
          validate: this.options.validate,
        }),
      )
    }

    if (this.options.openOnClick) {
      plugins.push(
        clickHandler({
          type: this.type,
        }),
      )
    }

    if (this.options.linkOnPaste) {
      plugins.push(
        pasteHandler({
          editor: this.editor,
          type: this.type,
        }),
      )
    }

    return plugins
  },
})
