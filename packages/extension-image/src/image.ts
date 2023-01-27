import {
  mergeAttributes,
  Node,
  nodeInputRule,
} from '@tiptap/core'

import imageUploader from './imageUploader'

export interface ImageInfo {
  src: string,
  title?: string,
  alt?: string,
}

export interface ImageOptions {
  inline: boolean,
  allowBase64: boolean,
  HTMLAttributes: Record<string, any>,
  placeholderSrc: string,
  types: string[],
  upload?: (fileOrUrl:String | File | Blob) => Promise<ImageInfo>,
  id: () => string
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
const replaceImageSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M1 14.5a6.496 6.496 0 0 1 3.064-5.519 8.001 8.001 0 0 1 15.872 0 6.5 6.5 0 0 1-2.936 12L7 21c-3.356-.274-6-3.078-6-6.5zm15.848 4.487a4.5 4.5 0 0 0 2.03-8.309l-.807-.503-.12-.942a6.001 6.001 0 0 0-11.903 0l-.12.942-.805.503a4.5 4.5 0 0 0 2.029 8.309l.173.013h9.35l.173-.013zM13 13v4h-2v-4H8l4-5 4 5h-3z"/></svg>'

export const Image = Node.create<ImageOptions>({
  name: 'image',

  addOptions() {
    return {
      inline: true,
      allowBase64: true,
      HTMLAttributes: {},
      placeholderSrc: `data:image/svg+xml,${replaceImageSvg}`,
      types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'],
      id: () => Math.random().toString(36).substring(7),
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
      id: {
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

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
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
      imageUploader(this.options),
    ]
  },
})
