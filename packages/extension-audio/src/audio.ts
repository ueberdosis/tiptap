import { createAtomBlockMarkdownSpec, mergeAttributes, Node, nodePasteRule } from '@tiptap/core'

import { AUDIO_URL_REGEX_GLOBAL, isValidAudioUrl, sanitizeAudioSrc } from './utils.js'

export interface AudioOptions {
  /**
   * Controls if the paste handler for audio sources should be added.
   * @default true
   * @example false
   */
  addPasteHandler: boolean

  /**
   * Controls if the audio should autoplay.
   * @default false
   * @example true
   */
  autoplay: boolean

  /**
   * Controls if the audio element should render the native controls.
   * @default true
   * @example false
   */
  controls: boolean

  /**
   * Controls if the audio should loop.
   * @default false
   * @example true
   */
  loop: boolean

  /**
   * Controls if the audio should be muted.
   * @default false
   * @example true
   */
  muted: boolean

  /**
   * The preload behavior for the audio element.
   * @default 'metadata'
   * @example 'none'
   */
  preload: 'auto' | 'metadata' | 'none' | null

  /**
   * Provides the controlslist attribute for the audio element.
   * @default undefined
   * @example 'nodownload'
   */
  controlslist?: string

  /**
   * Sets the crossorigin attribute for the audio element.
   * @default undefined
   * @example 'anonymous'
   */
  crossorigin?: '' | 'anonymous' | 'use-credentials'

  /**
   * Controls if remote playback should be disabled on the audio element.
   * @default false
   * @example true
   */
  disableRemotePlayback: boolean

  /**
   * Allows data: URLs for audio sources.
   * @default false
   * @example true
   */
  allowBase64: boolean

  /**
   * The HTML attributes for an audio node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>

  /**
   * Controls if the audio node should be inline or not.
   * @default false
   * @example true
   */
  inline: boolean
}

/**
 * The options for setting an audio element.
 */
type SetAudioOptions = {
  src: string
  controls?: boolean
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  preload?: 'auto' | 'metadata' | 'none' | null
  controlslist?: string
  crossorigin?: '' | 'anonymous' | 'use-credentials'
  disableremoteplayback?: boolean
  HTMLAttributes?: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    audio: {
      /**
       * Insert an audio element
       * @param options The audio attributes
       * @example editor.commands.setAudio({ src: 'https://assets.tiptap.dev/sounds/loop.mp3' })
       */
      setAudio: (options: SetAudioOptions) => ReturnType
    }
  }
}

/**
 * This extension adds support for native audio elements.
 */
export const Audio = Node.create<AudioOptions>({
  name: 'audio',

  addOptions() {
    return {
      addPasteHandler: true,
      allowBase64: false,
      autoplay: false,
      controls: true,
      loop: false,
      muted: false,
      preload: 'metadata',
      controlslist: undefined,
      crossorigin: undefined,
      disableRemotePlayback: false,
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

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: this.options.controls,
      },
      autoplay: {
        default: this.options.autoplay,
      },
      loop: {
        default: this.options.loop,
      },
      muted: {
        default: this.options.muted,
      },
      preload: {
        default: this.options.preload,
      },
      controlslist: {
        default: this.options.controlslist,
      },
      crossorigin: {
        default: this.options.crossorigin,
      },
      disableremoteplayback: {
        default: this.options.disableRemotePlayback,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: this.options.allowBase64 ? 'audio[src]' : 'audio[src]:not([src^="data:"])',
      },
    ]
  },

  addCommands() {
    return {
      setAudio:
        options =>
        ({ commands }) => {
          if (!isValidAudioUrl(options.src, this.options.allowBase64)) {
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
        find: AUDIO_URL_REGEX_GLOBAL,
        type: this.type,
        getAttributes: match => {
          return { src: match[0] }
        },
      }),
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const sanitizedSrc = sanitizeAudioSrc(HTMLAttributes.src, this.options.allowBase64)

    const mergedAttributes = mergeAttributes(
      this.options.HTMLAttributes,
      {
        controls: this.options.controls,
        autoplay: this.options.autoplay,
        loop: this.options.loop,
        muted: this.options.muted,
        preload: this.options.preload,
        controlslist: this.options.controlslist,
        crossorigin: this.options.crossorigin,
        disableremoteplayback: this.options.disableRemotePlayback,
      },
      {
        ...HTMLAttributes,
        src: sanitizedSrc,
      },
    )

    const cleanedAttributes = Object.fromEntries(
      Object.entries(mergedAttributes).filter(([, value]) => value !== null && value !== undefined && value !== false),
    )

    return ['audio', cleanedAttributes]
  },

  ...createAtomBlockMarkdownSpec({
    nodeName: 'audio',
    allowedAttributes: [
      'src',
      'controls',
      'autoplay',
      'loop',
      'muted',
      'preload',
      'controlslist',
      'crossorigin',
      'disableremoteplayback',
    ],
  }),
})
