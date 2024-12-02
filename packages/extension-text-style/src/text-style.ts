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
          if (!node.marks.some(mark => Object.values(mark.attrs).some(value => !!value))) {
            // Proceed with the removal of the `textStyle` mark for this node only
            tr.removeMark(pos, pos + node.nodeSize, this.type)
          }
        })

        return true
      },
    }
  },

})
