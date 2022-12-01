import {
  isFunction,
  mergeAttributes,
  Node,
  nodeInputRule,
} from '@tiptap/core'
import {
  Node as ProseMirrorNode,
} from 'prosemirror-model'
import { Plugin, PluginKey } from 'prosemirror-state'

export interface ImageOptions {
  inline: boolean,
  allowBase64: boolean,
  HTMLAttributes: Record<string, any> | ((input: ProseMirrorNode) => Record<string, any>),
  allowPasteFromClipboard: boolean,
  allowDragNDrop: boolean,
  // accept File and returns src attribute
  imageUpload?: ((image: any) => Promise<string>) | null
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      /**
       * Add an image
       */
      setImage: (options: { src: string, alt?: string, title?: string }) => ReturnType,
    }
  }
}

export const inputRegex = /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/

export const Image = Node.create<ImageOptions>({
  name: 'image',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
      allowPasteFromClipboard: false,
      allowDragNDrop: false,
      imageUpload: null,
    }
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
        tag: this.options.allowBase64
          ? 'img[src]'
          : 'img[src]:not([src^="data:"])',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const attrs = isFunction(this.options.HTMLAttributes)
      ? this.options.HTMLAttributes(node)
      : this.options.HTMLAttributes

    return ['img', mergeAttributes(attrs, HTMLAttributes)]
  },

  addCommands() {
    return {
      setImage: options => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: match => {
          const [,, alt, src, title] = match

          return { src, alt, title }
        },
      }),
    ]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageHandler'),
        props: {
          handlePaste: (view, event) => {
            if (!this.options.allowPasteFromClipboard) {
              return false
            }
            const items = Array.from(event.clipboardData?.items || [])

            event.preventDefault()

            items.forEach(item => {
              if (item.type.indexOf('image') === 0) {
                const { schema } = view.state

                const image = item.getAsFile()

                this.options.imageUpload?.(image).then(src => {
                  const node = schema.nodes.image.create({
                    src,
                  })
                  const transaction = view.state.tr.replaceSelectionWith(node)

                  view.dispatch(transaction)
                })
              }
            })
          },
          handleDOMEvents: {
            drop: (view, event) => {
              if (!this.options.allowDragNDrop) {
                return false
              }

              const hasFiles = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length

              if (!hasFiles) {
                return false
              }

              const images = Array.from(
                event.dataTransfer?.files ?? [],
              ).filter(file => /image/i.test(file.type))

              if (images.length === 0) {
                return false
              }

              event.preventDefault()

              const { schema } = view.state
              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              })

              if (!coordinates) { return false }

              images.forEach(async image => {

                const node = schema.nodes.image.create({
                  src: await this.options.imageUpload?.(image),
                })
                const transaction = view.state.tr.insert(coordinates.pos, node)

                view.dispatch(transaction)
              })

              return true
            },
          },
        },
      }),
    ]
  },
})
