import {
  getMarkAttributes,
  Mark,
  mergeAttributes,
} from '@tiptap/core'

export interface TextStyleOptions {
  /**
   * HTML attributes to add to the span element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>,
  /**
   * When enabled, merges the styles of nested spans into the child span during HTML parsing.
   * This prioritizes the style of the child span.
   * Used when parsing content created in other editors.
   * (Fix for ProseMirror's default behavior.)
   * @default false
   */
  mergeNestedSpanStyles: boolean,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textStyle: {
      /**
       * Remove spans without inline style attributes.
       * @example editor.commands.removeEmptyTextStyle()
       */
      removeEmptyTextStyle: () => ReturnType,
    }
  }
}

const mergeNestedSpanStyles = (element: HTMLElement) => {
  if (!element.children.length) { return }
  const childSpans = element.querySelectorAll('span')

  if (!childSpans) { return }

  childSpans.forEach(childSpan => {
    const childStyle = childSpan.getAttribute('style')
    const closestParentSpanStyleOfChild = childSpan.parentElement?.closest('span')?.getAttribute('style')

    childSpan.setAttribute('style', `${closestParentSpanStyleOfChild};${childStyle}`)

  })
}

/**
 * This extension allows you to create text styles. It is required by default
 * for the `textColor` and `backgroundColor` extensions.
 * @see https://www.tiptap.dev/api/marks/text-style
 */
export const TextStyle = Mark.create<TextStyleOptions>({
  name: 'textStyle',

  priority: 101,

  addOptions() {
    return {
      HTMLAttributes: {},
      mergeNestedSpanStyles: false,
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: element => {
          const hasStyles = (element as HTMLElement).hasAttribute('style')

          if (!hasStyles) {
            return false
          }
          if (this.options.mergeNestedSpanStyles) { mergeNestedSpanStyles(element) }

          return {}
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      removeEmptyTextStyle: () => ({ state, commands }) => {
        const attributes = getMarkAttributes(state, this.type)
        const hasStyles = Object.entries(attributes).some(([, value]) => !!value)

        if (hasStyles) {
          return true
        }

        return commands.unsetMark(this.name)
      },
    }
  },

})
