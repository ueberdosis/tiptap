import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core'

import { getEmbedUrlFromYoutubeUrl, isValidYoutubeUrl, YOUTUBE_REGEX_GLOBAL } from './utils.js'

export interface YoutubeOptions {
  /**
   * Controls if the paste handler for youtube videos should be added.
   * @default true
   * @example false
   */
  addPasteHandler: boolean;

  /**
   * Controls if the youtube video should be allowed to go fullscreen.
   * @default true
   * @example false
   */
  allowFullscreen: boolean;

  /**
   * Controls if the youtube video should autoplay.
   * @default false
   * @example true
   */
  autoplay: boolean;

  /**
   * The language of the captions shown in the youtube video.
   * @default undefined
   * @example 'en'
   */
  ccLanguage?: string;

  /**
   * Controls if the captions should be shown in the youtube video.
   * @default undefined
   * @example true
   */
  ccLoadPolicy?: boolean;

  /**
   * Controls if the controls should be shown in the youtube video.
   * @default true
   * @example false
   */
  controls: boolean;

  /**
   * Controls if the keyboard controls should be disabled in the youtube video.
   * @default false
   * @example true
   */
  disableKBcontrols: boolean;

  /**
   * Controls if the iframe api should be enabled in the youtube video.
   * @default false
   * @example true
   */
  enableIFrameApi: boolean;

  /**
   * The end time of the youtube video.
   * @default 0
   * @example 120
   */
  endTime: number;

  /**
   * The height of the youtube video.
   * @default 480
   * @example 720
   */
  height: number;

  /**
   * The language of the youtube video.
   * @default undefined
   * @example 'en'
   */
  interfaceLanguage?: string;

  /**
   * Controls if the video annotations should be shown in the youtube video.
   * @default 0
   * @example 1
   */
  ivLoadPolicy: number;

  /**
   * Controls if the youtube video should loop.
   * @default false
   * @example true
   */
  loop: boolean;

  /**
   * Controls if the youtube video should show a small youtube logo.
   * @default false
   * @example true
   */
  modestBranding: boolean;

  /**
   * The HTML attributes for a youtube video node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>;

  /**
   * Controls if the youtube node should be inline or not.
   * @default false
   * @example true
   */
  inline: boolean;

  /**
   * Controls if the youtube video should be loaded from youtube-nocookie.com.
   * @default false
   * @example true
   */
  nocookie: boolean;

  /**
   * The origin of the youtube video.
   * @default ''
   * @example 'https://tiptap.dev'
   */
  origin: string;

  /**
   * The playlist of the youtube video.
   * @default ''
   * @example 'PLQg6GaokU5CwiVmsZ0dZm6VeIg0V5z1tK'
   */
  playlist: string;

  /**
   * The color of the youtube video progress bar.
   * @default undefined
   * @example 'red'
   */
  progressBarColor?: string;

  /**
   * The width of the youtube video.
   * @default 640
   * @example 1280
   */
  width: number;
}

/**
 * The options for setting a youtube video.
 */
type SetYoutubeVideoOptions = { src: string, width?: number, height?: number, start?: number }

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    youtube: {
      /**
       * Insert a youtube video
       * @param options The youtube video attributes
       * @example editor.commands.setYoutubeVideo({ src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
       */
      setYoutubeVideo: (options: SetYoutubeVideoOptions) => ReturnType,
    }
  }
}

/**
 * This extension adds support for youtube videos.
 * @see https://www.tiptap.dev/api/nodes/youtube
 */
export const Youtube = Node.create<YoutubeOptions>({
  name: 'youtube',

  addOptions() {
    return {
      addPasteHandler: true,
      allowFullscreen: true,
      autoplay: false,
      ccLanguage: undefined,
      ccLoadPolicy: undefined,
      controls: true,
      disableKBcontrols: false,
      enableIFrameApi: false,
      endTime: 0,
      height: 480,
      interfaceLanguage: undefined,
      ivLoadPolicy: 0,
      loop: false,
      modestBranding: false,
      HTMLAttributes: {},
      inline: false,
      nocookie: false,
      origin: '',
      playlist: '',
      progressBarColor: undefined,
      width: 640,
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
      setYoutubeVideo: (options: SetYoutubeVideoOptions) => ({ commands }) => {
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

  addPasteRules() {
    if (!this.options.addPasteHandler) {
      return []
    }

    return [
      nodePasteRule({
        find: YOUTUBE_REGEX_GLOBAL,
        type: this.type,
        getAttributes: match => {
          return { src: match.input }
        },
      }),
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const embedUrl = getEmbedUrlFromYoutubeUrl({
      url: HTMLAttributes.src,
      allowFullscreen: this.options.allowFullscreen,
      autoplay: this.options.autoplay,
      ccLanguage: this.options.ccLanguage,
      ccLoadPolicy: this.options.ccLoadPolicy,
      controls: this.options.controls,
      disableKBcontrols: this.options.disableKBcontrols,
      enableIFrameApi: this.options.enableIFrameApi,
      endTime: this.options.endTime,
      interfaceLanguage: this.options.interfaceLanguage,
      ivLoadPolicy: this.options.ivLoadPolicy,
      loop: this.options.loop,
      modestBranding: this.options.modestBranding,
      nocookie: this.options.nocookie,
      origin: this.options.origin,
      playlist: this.options.playlist,
      progressBarColor: this.options.progressBarColor,
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
            autoplay: this.options.autoplay,
            ccLanguage: this.options.ccLanguage,
            ccLoadPolicy: this.options.ccLoadPolicy,
            disableKBcontrols: this.options.disableKBcontrols,
            enableIFrameApi: this.options.enableIFrameApi,
            endTime: this.options.endTime,
            interfaceLanguage: this.options.interfaceLanguage,
            ivLoadPolicy: this.options.ivLoadPolicy,
            loop: this.options.loop,
            modestBranding: this.options.modestBranding,
            origin: this.options.origin,
            playlist: this.options.playlist,
            progressBarColor: this.options.progressBarColor,
          },
          HTMLAttributes,
        ),
      ],
    ]
  },
})
