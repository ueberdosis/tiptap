import { Node, Command } from '@tiptap/core'

export interface IframeOptions {
  allowFullscreen: boolean,
  HTMLAttributes: {
    [key: string]: any
  },
}

export default Node.create({
  name: 'iframe',

  group: 'block',

  // selectable: false,

  defaultOptions: <IframeOptions>{
    allowFullscreen: true,
    HTMLAttributes: {
      class: 'iframe-wrapper',
    },
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      frameborder: {
        default: 0,
      },
      allowfullscreen: {
        default: this.options.allowFullscreen,
        parseHTML: () => {
          return {
            allowfullscreen: this.options.allowFullscreen,
          }
        },
      },
    }
  },

  parseHTML() {
    return [{
      tag: 'iframe',
    }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', this.options.HTMLAttributes, ['iframe', HTMLAttributes, 0]]
  },

  addCommands() {
    return {
      /**
       * Add an iframe
       */
      setIframe: (options: { src: string }): Command => ({ tr, dispatch }) => {
        const { selection } = tr
        const node = this.type.create(options)

        if (dispatch) {
          tr.replaceRangeWith(selection.from, selection.to, node)
        }

        return true
      },
    }
  },
})
