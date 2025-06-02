import {
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
      removeEmptyTextStyle: () => ({ tr }) => {

        const { selection } = tr

        // Gather all of the nodes within the selection range.
        // We would need to go through each node individually
        // to check if it has any inline style attributes.
        // Otherwise, calling commands.unsetMark(this.name)
        // removes everything from all the nodes
        // within the selection range.
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {

          // Check if it's a paragraph element, if so, skip this node as we apply
          // the text style to inline text nodes only (span).
          if (node.isTextblock) {
            return true
          }

          // Check if the node has no inline style attributes.
          // Filter out non-`textStyle` marks.
          if (
            !node.marks.filter(mark => mark.type === this.type).some(mark => Object.values(mark.attrs).some(value => !!value))) {
            // Proceed with the removal of the `textStyle` mark for this node only
            tr.removeMark(pos, pos + node.nodeSize, this.type)
          }
        })

        return true
      },
    }
  },

})
