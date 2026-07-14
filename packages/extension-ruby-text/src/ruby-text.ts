import { Mark, mergeAttributes } from '@tiptap/core'

import { RubyTextDecorationPlugin } from './ruby-text-decoration-plugin.js'

export interface RubyTextOptions {
  /**
   * HTML attributes to add to the ruby element.
   * @default {}
   */
  HTMLAttributes: Record<string, any>
  /**
   * Whether clicking an annotation opens an inline editor.
   * @default true
   */
  allowClickToEdit: boolean
}

export interface RubyTextAttributes {
  /**
   * The ruby text annotation rendered in the HTML `rt` element.
   */
  rt: string | null
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    rubyText: {
      /**
       * Set a ruby text mark with an annotation on the current selection.
       * @example editor.commands.setRubyText({ rt: 'かんじ' })
       */
      setRubyText: (attributes: RubyTextAttributes) => ReturnType
      /**
       * Toggle a ruby text mark on the current selection.
       * @example editor.commands.toggleRubyText({ rt: 'かんじ' })
       */
      toggleRubyText: (attributes: RubyTextAttributes) => ReturnType
      /**
       * Remove the ruby text mark from the current selection.
       * @example editor.commands.unsetRubyText()
       */
      unsetRubyText: () => ReturnType
    }
  }
}

/**
 * This extension adds support for HTML ruby text annotations.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ruby
 */
export const RubyText = Mark.create<RubyTextOptions>({
  name: 'rubyText',

  inclusive: false,

  addOptions() {
    return {
      HTMLAttributes: {},
      allowClickToEdit: true,
    }
  },

  addAttributes() {
    return {
      rt: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'ruby',
        contentElement: (node: HTMLElement) => {
          const rb = node.querySelector('rb')

          if (rb) {
            return rb
          }

          const surrogate = document.createElement('span')

          Array.from(node.childNodes).forEach(child => {
            if (child.nodeName !== 'RT' && child.nodeName !== 'RP') {
              surrogate.appendChild(child.cloneNode(true))
            }
          })

          return surrogate
        },
        getAttrs: (node: HTMLElement) => {
          const rt = node.querySelector('rt')

          if (!rt) {
            return false
          }

          return { rt: rt.textContent ?? '' }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes, mark }) {
    return [
      'ruby',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      ['rb', 0],
      ...(mark.attrs.rt == null ? [] : [['rt', { contenteditable: 'false' }, mark.attrs.rt]]),
    ]
  },

  addCommands() {
    return {
      setRubyText:
        attributes =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes)
        },
      toggleRubyText:
        attributes =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes, { extendEmptyMarkRange: true })
        },
      unsetRubyText:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name, { extendEmptyMarkRange: true })
        },
    }
  },

  addProseMirrorPlugins() {
    return [RubyTextDecorationPlugin(this.type, this.options.allowClickToEdit)]
  },

  addMarkView() {
    return ({ HTMLAttributes }) => {
      const ruby = document.createElement('ruby')

      Object.entries(mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)).forEach(
        ([key, value]) => {
          if (value != null) {
            ruby.setAttribute(key, String(value))
          }
        },
      )

      return {
        dom: ruby,
        contentDOM: ruby,
      }
    }
  },
})
