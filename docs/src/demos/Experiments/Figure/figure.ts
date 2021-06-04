import {
  Command,
  Node,
  nodeInputRule,
  mergeAttributes,
  findChildrenInRange,
} from '@tiptap/core'

export interface FigureOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands {
    figure: {
      /**
       * Add a figure element
       */
      setFigure: (options: {
        src: string,
        alt?: string,
        title?: string,
        caption?: string,
      }) => Command,

      /**
       * Converts an image to a figure
       */
      imageToFigure: () => Command,

      /**
       * Converts a figure to an image
       */
      figureToImage: () => Command,
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
        const nodes = findChildrenInRange(doc, { from, to }, node => node.type.name === 'image')

        if (!nodes.length) {
          return false
        }

        return commands.forEach(nodes, ({ node, pos }, { index }) => {
          const mappedPos = tr.steps
            .slice(tr.steps.length - index)
            .reduce((newPos, step) => step.getMap().map(newPos), pos)

          const range = {
            from: mappedPos,
            to: mappedPos + node.nodeSize,
          }

          return commands.insertContentAt(range, {
            type: this.name,
            attrs: {
              src: node.attrs.src,
            },
          })
        })
      },

      figureToImage: () => () => {
        return false
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
