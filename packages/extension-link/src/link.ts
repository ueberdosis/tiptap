import {
  Mark, markPasteRule, mergeAttributes, PasteRuleMatch,
} from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { find, registerCustomProtocol, reset } from 'linkifyjs'

import { autolink } from './helpers/autolink.js'
import { clickHandler } from './helpers/clickHandler.js'
import { pasteHandler } from './helpers/pasteHandler.js'

export interface LinkProtocolOptions {
  /**
   * The protocol scheme to be registered.
   * @default '''
   * @example 'ftp'
   * @example 'git'
   */
  scheme: string;

  /**
   * If enabled, it allows optional slashes after the protocol.
   * @default false
   * @example true
   */
  optionalSlashes?: boolean;
}

export const pasteRegex = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}\b(?:[-a-zA-Z0-9@:%._+~#=?!&/]*)(?:[-a-zA-Z0-9@:%._+~#=?!&/]*)/gi

/**
 * @deprecated The default behavior is now to open links when the editor is not editable.
 */
type DeprecatedOpenWhenNotEditable = 'whenNotEditable';

export interface LinkOptions {
  /**
   * If enabled, the extension will automatically add links as you type.
   * @default true
   * @example false
   */
  autolink: boolean

  /**
   * An array of custom protocols to be registered with linkifyjs.
   * @default []
   * @example ['ftp', 'git']
   */
  protocols: Array<LinkProtocolOptions | string>

  /**
   * Default protocol to use when no protocol is specified.
   * @default 'http'
   */
  defaultProtocol: string
  /**
   * If enabled, links will be opened on click.
   * @default true
   * @example false
   */
  openOnClick: boolean | DeprecatedOpenWhenNotEditable
  /**
   * Adds a link to the current selection if the pasted content only contains an url.
   * @default true
   * @example false
   */
  linkOnPaste: boolean

  /**
   * HTML attributes to add to the link element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>

  /**
   * A validation function that modifies link verification for the auto linker.
   * @param url - The url to be validated.
   * @returns - True if the url is valid, false otherwise.
   */
  validate: (url: string) => boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    link: {
      /**
       * Set a link mark
       * @param attributes The link attributes
       * @example editor.commands.setLink({ href: 'https://tiptap.dev' })
       */
      setLink: (attributes: { href: string; target?: string | null; rel?: string | null; class?: string | null }) => ReturnType
      /**
       * Toggle a link mark
       * @param attributes The link attributes
       * @example editor.commands.toggleLink({ href: 'https://tiptap.dev' })
       */
      toggleLink: (attributes: { href: string; target?: string | null; rel?: string | null; class?: string | null }) => ReturnType
      /**
       * Unset a link mark
       * @example editor.commands.unsetLink()
       */
      unsetLink: () => ReturnType
    }
  }
}

// From DOMPurify
// https://github.com/cure53/DOMPurify/blob/main/src/regexp.js
// eslint-disable-next-line no-control-regex
const ATTR_WHITESPACE = /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g

function isAllowedUri(uri: string | undefined, protocols?: LinkOptions['protocols']) {
  const allowedProtocols: string[] = ['http', 'https', 'ftp', 'ftps', 'mailto', 'tel', 'callto', 'sms', 'cid', 'xmpp']

  if (protocols) {
    protocols.forEach(protocol => {
      const nextProtocol = (typeof protocol === 'string' ? protocol : protocol.scheme)

      if (nextProtocol) {
        allowedProtocols.push(nextProtocol)
      }
    })
  }

  // eslint-disable-next-line no-useless-escape
  return !uri || uri.replace(ATTR_WHITESPACE, '').match(new RegExp(`^(?:(?:${allowedProtocols.join('|')}):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))`, 'i'))
}

/**
 * This extension allows you to create links.
 * @see https://www.tiptap.dev/api/marks/link
 */
export const Link = Mark.create<LinkOptions>({
  name: 'link',

  priority: 1000,

  keepOnSplit: false,

  exitable: true,

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
      defaultProtocol: 'http',
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
        class: null,
      },
      validate: url => !!url,
    }
  },

  addAttributes() {
    return {
      href: {
        default: null,
        parseHTML(element) {
          return element.getAttribute('href')
        },
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
    return [{
      tag: 'a[href]',
      getAttrs: dom => {
        const href = (dom as HTMLElement).getAttribute('href')

        // prevent XSS attacks
        if (!href || !isAllowedUri(href, this.options.protocols)) {
          return false
        }
        return null
      },
    }]
  },

  renderHTML({ HTMLAttributes }) {
    // prevent XSS attacks
    if (!isAllowedUri(HTMLAttributes.href, this.options.protocols)) {
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
        find: text => {
          const foundLinks: PasteRuleMatch[] = []

          if (text) {
            const { validate } = this.options
            const links = find(text).filter(item => item.isLink && validate(item.value))

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
          defaultProtocol: this.options.defaultProtocol,
          validate: this.options.validate,
        }),
      )
    }

    if (this.options.openOnClick === true) {
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
          defaultProtocol: this.options.defaultProtocol,
          type: this.type,
        }),
      )
    }

    return plugins
  },
})
