import { createAtomBlockMarkdownSpec, mergeAttributes, Node, nodePasteRule } from '@tiptap/core'

import { getEmbedUrlFromTwitchUrl, isValidTwitchUrl, TWITCH_REGEX_GLOBAL } from './utils.js'

export interface TwitchOptions {
  /**
   * Controls if the paste handler for Twitch videos should be added.
   * @default true
   * @example false
   */
  addPasteHandler: boolean

  /**
   * Controls if the Twitch video should be allowed to go fullscreen.
   * @default true
   * @example false
   */
  allowFullscreen: boolean

  /**
   * Controls if the Twitch video should autoplay.
   * @default false
   * @example true
   */
  autoplay: boolean

  /**
   * Controls if the Twitch video should start muted.
   * @default false
   * @example true
   */
  muted: boolean

  /**
   * The time in the video where playback starts (format: 1h2m3s).
   * Only works for video embeds, not for clips or channels.
   * @default undefined
   * @example '1h2m3s'
   */
  time?: string

  /**
   * The parent domain for the Twitch embed. Required for embed functionality.
   * @default 'localhost'
   * @example 'example.com'
   */
  parent: string

  /**
   * The height of the Twitch video.
   * @default 480
   * @example 720
   */
  height: number

  /**
   * The width of the Twitch video.
   * @default 640
   * @example 1280
   */
  width: number

  /**
   * The HTML attributes for a Twitch video node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>

  /**
   * Controls if the Twitch node should be inline or not.
   * @default false
   * @example true
   */
  inline: boolean
}

/**
 * The options for setting a Twitch video.
 */
type SetTwitchVideoOptions = {
  src: string
  width?: number
  height?: number
  autoplay?: boolean
  muted?: boolean
  time?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    twitch: {
      /**
       * Insert a Twitch video
       * @param options The Twitch video attributes
       * @example editor.commands.setTwitchVideo({ src: 'https://www.twitch.tv/videos/1234567890' })
       */
      setTwitchVideo: (options: SetTwitchVideoOptions) => ReturnType
    }
  }
}

/**
 * This extension adds support for Twitch videos.
 * @see https://www.tiptap.dev/api/nodes/twitch
 *
 * @example
 * ```ts
 * import { useEditor, EditorContent } from '@tiptap/react'
 * import { StarterKit } from '@tiptap/starter-kit'
 * import { Twitch } from '@tiptap/extension-twitch'
 *
 * const editor = useEditor({
 *   extensions: [
 *     StarterKit,
 *     Twitch.configure({
 *       parent: 'example.com',
 *       allowFullscreen: true,
 *     }),
 *   ],
 *   content: '<p>Hello World!</p>',
 * })
 * ```
 */
export const Twitch = Node.create<TwitchOptions>({
  name: 'twitch',

  addOptions() {
    return {
      addPasteHandler: true,
      allowFullscreen: true,
      autoplay: false,
      muted: false,
      time: undefined,
      parent: 'localhost',
      height: 480,
      width: 640,
      HTMLAttributes: {},
      inline: false,
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
      width: {
        default: this.options.width,
      },
      height: {
        default: this.options.height,
      },
      autoplay: {
        default: this.options.autoplay,
      },
      muted: {
        default: this.options.muted,
      },
      time: {
        default: this.options.time,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-twitch-video] iframe',
      },
    ]
  },

  addCommands() {
    return {
      setTwitchVideo:
        (options: SetTwitchVideoOptions) =>
        ({ commands }) => {
          if (!isValidTwitchUrl(options.src)) {
            return false
          }

          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },

  addPasteRules() {
    if (!this.options.addPasteHandler) {
      return []
    }

    return [
      nodePasteRule({
        find: TWITCH_REGEX_GLOBAL,
        type: this.type,
        getAttributes: match => {
          return { src: match.input }
        },
      }),
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const embedUrl = getEmbedUrlFromTwitchUrl({
      url: HTMLAttributes.src,
      allowFullscreen: this.options.allowFullscreen,
      autoplay: HTMLAttributes.autoplay ?? this.options.autoplay,
      muted: HTMLAttributes.muted ?? this.options.muted,
      time: HTMLAttributes.time ?? this.options.time,
      parent: this.options.parent,
    })

    if (!embedUrl) {
      return ['div', 'Invalid Twitch URL']
    }

    HTMLAttributes.src = embedUrl

    return [
      'div',
      { 'data-twitch-video': '' },
      [
        'iframe',
        mergeAttributes(
          this.options.HTMLAttributes,
          {
            width: this.options.width,
            height: this.options.height,
            allowfullscreen: this.options.allowFullscreen,
            scrolling: 'no',
            frameborder: '0',
          },
          HTMLAttributes,
        ),
      ],
    ]
  },

  ...createAtomBlockMarkdownSpec({
    nodeName: 'twitch',
    allowedAttributes: ['src', 'width', 'height', 'autoplay', 'muted', 'time'],
  }),
})
