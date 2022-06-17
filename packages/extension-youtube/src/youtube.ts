import { mergeAttributes, Node } from '@tiptap/core'

import { getEmbedURLFromYoutubeURL, isValidYoutubeUrl } from './utils'

export interface YoutubeOptions {
  inline: boolean;
  width: number;
  height: number;
  controls: boolean;
  nocookie: boolean;
  allowFullscreen: boolean;
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    youtube: {
      /**
       * Insert a youtube video
       */
      setYoutubeVideo: (options: { src: string, width?: number, height?: number, start?: number }) => ReturnType,
    }
  }
}

export const Youtube = Node.create<YoutubeOptions>({
  name: 'youtube',

  addOptions() {
    return {
      inline: false,
      controls: true,
      HTMLAttributes: {},
      nocookie: false,
      allowFullscreen: false,
      width: 640,
      height: 480,
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
      start: {
        default: 0,
      },
      width: {
        default: this.options.width,
      },
      height: {
        default: this.options.height,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-youtube-video] iframe',
      },
    ]
  },

  addCommands() {
    return {
      setYoutubeVideo: options => ({ commands }) => {
        if (!isValidYoutubeUrl(options.src)) {
          return false
        }

        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    const embedUrl = getEmbedURLFromYoutubeURL({
      url: HTMLAttributes.src,
      controls: this.options.controls,
      nocookie: this.options.nocookie,
      startAt: HTMLAttributes.start || 0,
    })

    HTMLAttributes.src = embedUrl

    return [
      'div',
      { 'data-youtube-video': '' },
      [
        'iframe',
        mergeAttributes(
          this.options.HTMLAttributes,
          {
            width: this.options.width,
            height: this.options.height,
            allowfullscreen: this.options.allowFullscreen,
          },
          HTMLAttributes,
        ),
      ],
    ]
  },
})
