import {
  Node,
  nodeInputRule,
  mergeAttributes,
  findChildrenInRange,
  Tracker,
} from '@tiptap/core'

export interface FigureOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    figure: {
      /**
       * Add a figure element
       */
      setFigure: (options: {
        src: string,
        alt?: string,
        title?: string,
        caption?: string,
      }) => ReturnType,

      /**
       * Converts an image to a figure
       */
      imageToFigure: () => ReturnType,

      /**
       * Converts a figure to an image
       */
      figureToImage: () => ReturnType,
    }
  }
}

export const inputRegex = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/

export const Figure = Node.create<FigureOptions>({
  name: 'figure',

  defaultOptions: {
    HTMLAttributes: {},
  },

  group: 'block',

  content: 'inline*',

  draggable: true,

  isolating: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => {
          return {
            src: element.querySelector('img')?.getAttribute('src'),
          }
        },
      },

      alt: {
        default: null,
        parseHTML: element => {
          return {
            alt: element.querySelector('img')?.getAttribute('alt'),
          }
        },
      },

      title: {
        default: null,
        parseHTML: element => {
          return {
            title: element.querySelector('img')?.getAttribute('title'),
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
        contentElement: 'figcaption',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'figure', this.options.HTMLAttributes,
      ['img', mergeAttributes(HTMLAttributes, { draggable: false, contenteditable: false })],
      ['figcaption', 0],
    ]
  },

  addCommands() {
    return {
      setFigure: ({ caption, ...attrs }) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs,
            content: caption
              ? [{ type: 'text', text: caption }]
              : [],
          })
          // set cursor at end of caption field
          .command(({ tr, commands }) => {
            const { doc, selection } = tr
            const position = doc.resolve(selection.to - 2).end()

            return commands.setTextSelection(position)
          })
          .run()
      },

      imageToFigure: () => ({ tr, commands }) => {
        const { doc, selection } = tr
        const { from, to } = selection
        const images = findChildrenInRange(doc, { from, to }, node => node.type.name === 'image')

        if (!images.length) {
          return false
        }

        const tracker = new Tracker(tr)

        return commands.forEach(images, ({ node, pos }) => {
          const mapResult = tracker.map(pos)

          if (mapResult.deleted) {
            return false
          }

          const range = {
            from: mapResult.position,
            to: mapResult.position + node.nodeSize,
          }

          return commands.insertContentAt(range, {
            type: this.name,
            attrs: {
              src: node.attrs.src,
            },
          })
        })
      },

      figureToImage: () => ({ tr, commands }) => {
        const { doc, selection } = tr
        const { from, to } = selection
        const figures = findChildrenInRange(doc, { from, to }, node => node.type.name === this.name)

        if (!figures.length) {
          return false
        }

        const tracker = new Tracker(tr)

        return commands.forEach(figures, ({ node, pos }) => {
          const mapResult = tracker.map(pos)

          if (mapResult.deleted) {
            return false
          }

          const range = {
            from: mapResult.position,
            to: mapResult.position + node.nodeSize,
          }

          return commands.insertContentAt(range, {
            type: 'image',
            attrs: {
              src: node.attrs.src,
            },
          })
        })
      },
    }
  },

  addInputRules() {
    return [
      nodeInputRule(inputRegex, this.type, match => {
        const [, alt, src, title] = match

        return { src, alt, title }
      }),
    ]
  },
})
