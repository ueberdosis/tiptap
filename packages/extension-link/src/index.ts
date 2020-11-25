import {
  Command,
  Mark,
  markPasteRule,
  mergeAttributes,
} from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

export interface LinkOptions {
  openOnClick: boolean,
  HTMLAttributes: {
    [key: string]: any
  },
}

export const pasteRegex = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}\b(?:[-a-zA-Z0-9@:%._+~#=?!&/]*)(?:[-a-zA-Z0-9@:%._+~#=?!&/]*)/gi
export const pasteRegexWithBrackets = /(?:\()https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}\b(?:[-a-zA-Z0-9@:%._+~#=?!&/()]*)(?:\))/gi

const Link = Mark.create({
  name: 'link',

  inclusive: false,

  defaultOptions: <LinkOptions>{
    openOnClick: true,
    HTMLAttributes: {
      target: '_blank',
      rel: 'noopener noreferrer nofollow',
    },
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
      /**
       * Set a link mark
       */
      setLink: (attributes: { href?: string, target?: string } = {}): Command => ({ commands }) => {
        return commands.setMark('link', attributes)
      },
      /**
       * Toggle a link mark
       */
      toggleLink: (attributes: { href?: string, target?: string } = {}): Command => ({ commands }) => {
        return commands.toggleMark('link', attributes)
      },
      /**
       * Unset a link mark
       */
      unsetLink: (): Command => ({ commands }) => {
        return commands.unsetMark('link')
      },
    }
  },

  addPasteRules() {
    return [
      markPasteRule(pasteRegex, this.type, (url: string) => ({ href: url })),
      markPasteRule(pasteRegexWithBrackets, this.type, (url: string) => ({ href: url })),
    ]
  },

  addProseMirrorPlugins() {
    if (!this.options.openOnClick) {
      return []
    }

    return [
      new Plugin({
        key: new PluginKey('handleClick'),
        props: {
          handleClick: (view, pos, event) => {
            const attrs = this.editor.getMarkAttributes('link')

            if (attrs.href && event.target instanceof HTMLAnchorElement) {
              window.open(attrs.href, attrs.target)

              return false
            }

            return true
          },
        },
      }),
    ]
  },
})

export default Link

declare module '@tiptap/core' {
  interface AllExtensions {
    Link: typeof Link,
  }
}
