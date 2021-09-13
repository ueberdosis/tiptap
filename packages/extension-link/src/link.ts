import {
  Mark,
  markPasteRuleNew,
  mergeAttributes,
} from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
// @ts-expect-error
import { find } from 'linkifyjs'

type LinkifyResult = {
  start: number,
  end: number,
  href: string,
  isLink: boolean,
  type: string,
  value: string,
}

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

const controlCodes = '\\u0000-\\u0020\\u007f-\\u009f'

/**
 * A regex that matches any string that contains a link
 * Source: https://github.com/microsoft/vscode/blob/75edf2085499820eea1867efc83c8b4ce54cdcd4/src/vs/workbench/contrib/debug/browser/linkDetector.ts#L21-L22
 */
export const pasteRegex = new RegExp(`(?:[a-zA-Z][a-zA-Z0-9+.-]{2,}:\\/\\/|data:|www\\.)[^\\s${controlCodes}"]{2,}[^\\s${controlCodes}"')}\\],:;.!?]`, 'ug')

/**
 * A regex that matches an url
 */
export const pasteRegexExact = new RegExp(`^${pasteRegex}$`, 'ug')

export const Link = Mark.create<LinkOptions>({
  name: 'link',

  priority: 1000,

  inclusive: false,

  defaultOptions: {
    openOnClick: true,
    linkOnPaste: true,
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
      markPasteRuleNew({
        matcher: text => (find(text) as LinkifyResult[])
          .filter(link => link.isLink)
          .map(link => ({
            text: link.value,
            index: link.start,
            link,
          })),
        type: this.type,
        getAttributes: match => ({
          href: match.link.href,
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

              const link = (find(textContent) as LinkifyResult[])
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

    return plugins
  },
})
