import {
  Command, Mark, markPasteRule,
} from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

export interface LinkOptions {
  openOnClick: boolean,
  target: string,
}

export type LinkCommand = () => Command

declare module '@tiptap/core/src/Editor' {
  interface Commands {
    link: LinkCommand,
  }
}

export const pasteRegex = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}\b(?:[-a-zA-Z0-9@:%_+.~#?&//=]*)/gi

export default new Mark<LinkOptions>()
  .name('link')
  .defaults({
    openOnClick: true,
    target: '',
  })
  .schema(({ options }) => ({
    attrs: {
      href: {
        default: null,
      },
      target: {
        default: null,
      },
    },
    inclusive: false,
    parseDOM: [
      {
        tag: 'a[href]',
        getAttrs: node => ({
          href: (node as HTMLElement).getAttribute('href'),
          target: (node as HTMLElement).getAttribute('target'),
        }),
      },
    ],
    toDOM: node => ['a', {
      ...node.attrs,
      rel: 'noopener noreferrer nofollow',
      target: options.target,
    }, 0],
  }))
  .commands(({ name }) => ({
    link: () => ({ commands }) => {
      return commands.toggleMark(name)
    },
  }))
  .pasteRules(({ type }) => [
    markPasteRule(pasteRegex, type, (url: string) => ({ href: url })),
  ])
  .plugins(({ editor, options, name }) => {
    if (!options.openOnClick) {
      return []
    }

    return [
      new Plugin({
        key: new PluginKey('handleClick'),
        props: {
          handleClick: (view, pos, event) => {
            const attrs = editor.getMarkAttrs(name)

            if (attrs.href && event.target instanceof HTMLAnchorElement) {
              window.open(attrs.href, attrs.target)

              return false
            }

            return true
          },
        },
      }),
    ]
  })
  .create()
