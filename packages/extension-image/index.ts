import { Command, createNode, nodeInputRule } from '@tiptap/core'
import { Plugin } from 'prosemirror-state'

const IMAGE_INPUT_REGEX = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/

const Image = createNode({
  name: 'image',

  inline: true,

  group: 'inline',

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
      image: (attrs: any): Command => ({ tr }) => {
        const { selection } = tr
        console.log({ selection })
        // const position = selection.$cursor ? selection.$cursor.pos : selection.$to.pos
        const position = selection.$anchor ? selection.$anchor.pos : selection.$to.pos
        const node = this.type.create(attrs)
        tr.insert(position, node)

        return true
      },
    }
  },

  addInputRules() {
    return [
      nodeInputRule(IMAGE_INPUT_REGEX, this.type, match => {
        const [, alt, src, title] = match
        return {
          src,
          alt,
          title,
        }
      }),
    ]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            drop(view, event) {
              const hasFiles = event.dataTransfer
                && event.dataTransfer.files
                && event.dataTransfer.files.length

              if (!hasFiles) {
                return false
              }

              const images = Array
                // @ts-ignore
                .from(event.dataTransfer.files)
                .filter(file => (/image/i).test(file.type))

              if (images.length === 0) {
                return false
              }

              event.preventDefault()

              const { schema } = view.state
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })

              images.forEach(image => {
                const reader = new FileReader()

                reader.onload = readerEvent => {
                  const node = schema.nodes.image.create({
                    // @ts-ignore
                    src: readerEvent.target.result,
                  })
                  // @ts-ignore
                  const transaction = view.state.tr.insert(coordinates.pos, node)
                  view.dispatch(transaction)
                }
                reader.readAsDataURL(image)
              })

              return true
            },
          },
        },
      }),
    ]
  },
})

export default Image

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    Image: typeof Image,
  }
}
