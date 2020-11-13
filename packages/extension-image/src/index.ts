import { Command, createNode, nodeInputRule } from '@tiptap/core'

export interface ImageOptions {
  inline: boolean,
}

export const inputRegex = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/

const Image = createNode({
  name: 'image',

  defaultOptions: <ImageOptions>{
    inline: false,
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ]
  },

  renderHTML({ attributes }) {
    return ['img', attributes]
  },

  addCommands() {
    return {
      /**
       * Add an image
       */
      image: (options: { src: string, alt?: string, title?: string }): Command => ({ tr }) => {
        const { selection } = tr
        const node = this.type.create(options)

        tr.replaceRangeWith(selection.from, selection.to, node)

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

export default Image

declare module '@tiptap/core' {
  interface AllExtensions {
    Image: typeof Image,
  }
}
