import {
  Command,
  Node,
  nodeInputRule,
  mergeAttributes,
  findChildrenInRange,
  isNodeSelection,
  Predicate,
  NodeWithPos,
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

      imageToFigure: () => ({ tr }) => {
        const { doc, selection } = tr
        const nodes: NodeWithPos[] = []
        const predicate: Predicate = node => node.type.name === 'image'

        if (isNodeSelection(selection)) {
          const node = doc.nodeAt(selection.from)

          if (!node || !predicate(node)) {
            return false
          }

          nodes.push({ node, pos: selection.from })
        } else {
          const range = {
            from: selection.from,
            to: selection.to,
          }

          nodes.push(...findChildrenInRange(doc, range, predicate))
        }

        if (!nodes.length) {
          return false
        }

        nodes.forEach(({ node, pos }, index) => {
          const mappedPos = tr.steps
            .slice(tr.steps.length - index)
            .reduce((newPos, step) => step.getMap().map(newPos), pos)

          tr.replaceRangeWith(mappedPos, mappedPos + node.nodeSize, this.type.create({
            src: node.attrs.src,
          }))
        })

        return true
      },

      figureToImage: () => () => {
        return true
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
