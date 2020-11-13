import {
  Command, createMark, markPasteRule, mergeAttributes,
} from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

export interface LinkOptions {
  openOnClick: boolean,
  target: string,
  rel: string,
}

export const pasteRegex = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}\b(?:[-a-zA-Z0-9@:%._+~#=?!&/()]*)/gi

const Link = createMark({
  name: 'link',

  inclusive: false,

  defaultOptions: <LinkOptions>{
    openOnClick: true,
    target: '_blank',
    rel: 'noopener noreferrer nofollow',
  },

  addAttributes() {
    return {
      href: {
        default: null,
      },
      target: {
        default: this.options.target,
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'a[href]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['a', mergeAttributes(HTMLAttributes, { rel: this.options.rel }), 0]
  },

  addCommands() {
    return {
      link: (options: { href?: string, target?: string } = {}): Command => ({ commands }) => {
        if (!options.href) {
          return commands.removeMark('link')
        }

        return commands.updateMarkAttributes('link', options)
      },
    }
  },

  addPasteRules() {
    return [
      markPasteRule(pasteRegex, this.type, (url: string) => ({ href: url })),
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
            const attrs = this.editor.getMarkAttrs('link')

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
