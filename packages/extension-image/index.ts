import { Command, createNode, nodeInputRule } from '@tiptap/core'
import { VueRenderer } from '@tiptap/vue'
import Vue from 'vue'

export const inputRegex = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/

const Image = createNode({
  name: 'image',

  inline: true,

  group: 'inline',

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

  addNodeView() {
    const Component = Vue.extend({
      template: '<div>this is a vue component</div>',
    })

    return VueRenderer(Component)
  },
})

export default Image

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    Image: typeof Image,
  }
}
