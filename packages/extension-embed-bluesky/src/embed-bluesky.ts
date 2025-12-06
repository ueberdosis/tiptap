import { createAtomBlockMarkdownSpec, mergeAttributes, Node, nodePasteRule } from '@tiptap/core'

import {
  BLUESKY_REGEX_GLOBAL,
  extractBlueskeyDataFromUrl,
  isValidBlueskeyUrl,
  loadBlueskeyEmbedScript,
  resolveBlueskeyEmbed,
} from './utils.js'

export interface EmbedBlueskeyOptions {
  /**
   * Controls if the paste handler for Bluesky posts should be added.
   * @default true
   * @example false
   */
  addPasteHandler: boolean

  /**
   * The color mode for the Bluesky embed.
   * @default 'system'
   * @example 'light'
   */
  colorMode: 'light' | 'dark' | 'system'

  /**
   * The HTML attributes for a Bluesky post node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>

  /**
   * Controls if the Bluesky node should be inline or not.
   * @default false
   * @example true
   */
  inline: boolean

  /**
   * Custom HTML to display while loading the embed.
   * Can be a string of HTML or a function that returns HTML.
   *
   * @default '<p class="bluesky-embed-loading">Loading Bluesky embed…</p>'
   *
   * @example
   * ```ts
   * loadingHTML: '<div class="spinner"></div>'
   * ```
   *
   * @example
   * ```ts
   * loadingHTML: () => '<div class="spinner"><span></span></div>'
   * ```
   *
   * @example
   * ```ts
   * // Dynamic spinner with access to extension options
   * loadingHTML: () => '<div style="padding: 1rem; text-align: center;">Loading...</div>'
   * ```
   */
  loadingHTML: string | (() => string)

  /**
   * Custom HTML to display when embed loading fails.
   * Can be a string of HTML or a function that returns HTML.
   * If not provided, falls back to a default error message with a link.
   *
   * @default null
   *
   * @example
   * ```ts
   * onError: (error, url) => '<div class="error">Failed to load embed</div>'
   * ```
   *
   * @example
   * ```ts
   * onError: (error, url) => `<a href="${url}">View on Bluesky</a>`
   * ```
   */
  onError: ((error: Error, url: string) => string) | null
}

/**
 * The options for setting a Bluesky embed.
 */
type SetBlueskeyEmbedOptions = {
  src: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embedBluesky: {
      /**
       * Insert a Bluesky embed
       * @param options The Bluesky post URL
       * @example editor.commands.setEmbedBluesky({ src: 'https://bsky.app/profile/user/post/12345' })
       */
      setEmbedBluesky: (options: SetBlueskeyEmbedOptions) => ReturnType

      /**
       * Update embed with resolved URI, CID, and metadata (used internally after fetching)
       */
      setEmbedBlueskeyResolved: (options: { uri: string; cid: string; handle: string; postId: string }) => ReturnType
    }
  }
}

/**
 * This extension adds support for Bluesky post embeds.
 * @see https://www.tiptap.dev/api/nodes/embed-bluesky
 *
 * @example
 * ```ts
 * import { useEditor, EditorContent } from '@tiptap/react'
 * import { StarterKit } from '@tiptap/starter-kit'
 * import { EmbedBluesky } from '@tiptap/extension-embed-bluesky'
 *
 * const editor = useEditor({
 *   extensions: [
 *     StarterKit,
 *     EmbedBluesky.configure({
 *       colorMode: 'light',
 *     }),
 *   ],
 *   content: '<p>Hello World!</p>',
 * })
 * ```
 */
export const EmbedBluesky = Node.create<EmbedBlueskeyOptions>({
  name: 'embedBluesky',
  atom: true,

  addOptions() {
    return {
      addPasteHandler: true,
      colorMode: 'system',
      HTMLAttributes: {},
      inline: false,
      loadingHTML: '<p class="bluesky-embed-loading">Loading Bluesky embed…</p>',
      onError: null,
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
      uri: {
        default: null,
      },
      cid: {
        default: null,
      },
      handle: {
        default: null,
      },
      postId: {
        default: null,
      },
      colorMode: {
        default: this.options.colorMode,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'blockquote[data-bluesky-uri]',
        getAttrs: element => {
          const uri = element.getAttribute('data-bluesky-uri')
          const cid = element.getAttribute('data-bluesky-cid')
          const src = element.getAttribute('data-bluesky-src')

          return {
            src,
            uri,
            cid,
          }
        },
      },
      {
        tag: 'blockquote[data-bluesky-src]',
        getAttrs: element => {
          const src = element.getAttribute('data-bluesky-src')

          return {
            src,
          }
        },
      },
    ]
  },

  addCommands() {
    return {
      setEmbedBluesky:
        (options: SetBlueskeyEmbedOptions) =>
        ({ commands }: any) => {
          if (!isValidBlueskeyUrl(options.src)) {
            return false
          }

          return commands.insertContent({
            type: this.name,
            attrs: { src: options.src },
          })
        },

      setEmbedBlueskeyResolved:
        (options: { uri: string; cid: string; handle: string; postId: string }) =>
        ({ commands }: any) => {
          return commands.updateAttributes(this.name, {
            uri: options.uri,
            cid: options.cid,
            handle: options.handle,
            postId: options.postId,
            src: null, // Clear the source URL after resolution to save space
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
        find: BLUESKY_REGEX_GLOBAL,
        type: this.type,
        getAttributes: match => {
          return { src: match.input }
        },
      }),
    ]
  },

  addNodeView() {
    return ({ node, editor }: any) => {
      const dom = document.createElement('div')
      const blockquote = document.createElement('blockquote')

      blockquote.className = 'bluesky-embed'
      blockquote.setAttribute('data-bluesky-color-mode', node.attrs.colorMode ?? this.options.colorMode)

      // Show loading state
      blockquote.setAttribute('data-state', 'loading')
      blockquote.innerHTML =
        typeof this.options.loadingHTML === 'function' ? this.options.loadingHTML() : this.options.loadingHTML
      dom.appendChild(blockquote)

      // Load embed script once
      loadBlueskeyEmbedScript()

      // Only fetch if we don't already have resolved uri/cid (collaborative optimization)
      // This ensures only the first client (inserter) fetches, others use cached data
      const shouldFetch = !node.attrs.uri || !node.attrs.cid

      ;(async () => {
        try {
          let uri = node.attrs.uri
          let cid = node.attrs.cid

          // If not already resolved, fetch from API
          if (shouldFetch) {
            blockquote.setAttribute('data-state', 'resolving')
            const resolved = await resolveBlueskeyEmbed(node.attrs.src)

            if (resolved?.uri && resolved?.cid) {
              uri = resolved.uri
              cid = resolved.cid

              const blueskeyData = extractBlueskeyDataFromUrl(node.attrs.src)
              if (blueskeyData) {
                // Update the document with resolved data so other clients don't need to fetch
                // Also clear src to save space in the document
                editor.commands.setEmbedBlueskeyResolved({
                  uri,
                  cid,
                  handle: blueskeyData.profileHandle,
                  postId: blueskeyData.postId,
                })
              }
            }
          }

          // If we have uri and cid, set them on the blockquote
          if (uri && cid) {
            // Use stored handle/postId or extract from src
            const handle = node.attrs.handle || extractBlueskeyDataFromUrl(node.attrs.src)?.profileHandle
            const postId = node.attrs.postId || extractBlueskeyDataFromUrl(node.attrs.src)?.postId

            blockquote.setAttribute('data-bluesky-uri', uri)
            blockquote.setAttribute('data-bluesky-cid', cid)
            blockquote.setAttribute('data-state', 'resolved')

            // Add fallback content that the embed script can replace
            if (handle && postId) {
              blockquote.innerHTML = `
                <p lang="en">
                  <a href="https://bsky.app/profile/${handle}/post/${postId}?ref_src=embed">
                    View on Bluesky
                  </a>
                </p>
              `
            }

            // Trigger Bluesky embed script to process the blockquote
            // Method 1: Call the global function if available
            if (typeof (window as any).bsky !== 'undefined' && (window as any).bsky.embed) {
              ;(window as any).bsky.embed()
            } else {
              // Method 2: Force script reload to trigger processing
              const existingScript = document.querySelector('script[src="https://embed.bsky.app/static/embed.js"]')
              if (existingScript) {
                const newScript = document.createElement('script')
                newScript.src = 'https://embed.bsky.app/static/embed.js'
                newScript.async = true
                newScript.charset = 'utf-8'
                document.head.appendChild(newScript)
              }
            }
          } else {
            // Resolution failed or couldn't fetch, show error or fallback link
            blockquote.setAttribute('data-state', 'error')
            const blueskeyData = extractBlueskeyDataFromUrl(node.attrs.src)

            // Use custom error handler if provided
            if (this.options.onError && blueskeyData) {
              blockquote.innerHTML = this.options.onError(new Error('Failed to resolve Bluesky embed'), node.attrs.src)
            } else if (blueskeyData) {
              blockquote.innerHTML = `
                <p lang="en">
                  <a href="https://bsky.app/profile/${blueskeyData.profileHandle}/post/${blueskeyData.postId}?ref_src=embed">
                    View on Bluesky
                  </a>
                </p>
              `
            } else {
              blockquote.innerHTML = `<p>Failed to load Bluesky embed. <a href="${node.attrs.src}">View on Bluesky</a></p>`
            }
          }
        } catch (error) {
          console.warn('Error resolving Bluesky embed:', error)
          blockquote.setAttribute('data-state', 'error')

          const blueskeyData = extractBlueskeyDataFromUrl(node.attrs.src)

          // Use custom error handler if provided
          if (this.options.onError && blueskeyData) {
            blockquote.innerHTML = this.options.onError(
              error instanceof Error ? error : new Error(String(error)),
              node.attrs.src,
            )
          } else if (blueskeyData) {
            blockquote.innerHTML = `
              <p lang="en">
                <a href="https://bsky.app/profile/${blueskeyData.profileHandle}/post/${blueskeyData.postId}?ref_src=embed">
                  View on Bluesky
                </a>
              </p>
            `
          } else {
            blockquote.innerHTML = `<p>Failed to load Bluesky embed. <a href="${node.attrs.src}">View on Bluesky</a></p>`
          }
        }
      })()

      return {
        dom,
        update: updatedNode => {
          // Reuse the same DOM if src hasn't changed
          return updatedNode.type === node.type && updatedNode.attrs.src === node.attrs.src
        },
        destroy() {},
      }
    }
  },

  renderHTML({ HTMLAttributes }) {
    // If we have resolved uri/cid, output the full embed blockquote
    if (HTMLAttributes.uri && HTMLAttributes.cid) {
      const handle = HTMLAttributes.handle || 'user.bsky.social'
      const postId = HTMLAttributes.postId || 'unknown'

      return [
        'blockquote',
        mergeAttributes(this.options.HTMLAttributes, {
          class: 'bluesky-embed',
          'data-bluesky-uri': HTMLAttributes.uri,
          'data-bluesky-cid': HTMLAttributes.cid,
          'data-bluesky-embed-color-mode': HTMLAttributes.colorMode ?? this.options.colorMode,
        }),
        [
          'p',
          { lang: 'en' },
          [
            'a',
            {
              href: `https://bsky.app/profile/${handle}/post/${postId}?ref_src=embed`,
            },
            'View on Bluesky',
          ],
        ],
      ]
    }

    // Fallback: if we have src but no uri/cid yet, render with src for fetching
    if (HTMLAttributes.src) {
      const blueskeyData = extractBlueskeyDataFromUrl(HTMLAttributes.src)

      if (!blueskeyData) {
        return ['div', 'Invalid Bluesky URL']
      }

      const { profileHandle, postId } = blueskeyData

      return [
        'blockquote',
        mergeAttributes(this.options.HTMLAttributes, {
          class: 'bluesky-embed',
          'data-bluesky-src': HTMLAttributes.src,
          'data-bluesky-embed-color-mode': HTMLAttributes.colorMode ?? this.options.colorMode,
        }),
        [
          'p',
          { lang: 'en' },
          [
            'a',
            {
              href: `https://bsky.app/profile/${profileHandle}/post/${postId}?ref_src=embed`,
            },
            'View on Bluesky',
          ],
        ],
      ]
    }

    return ['div', 'Invalid Bluesky embed']
  },

  ...createAtomBlockMarkdownSpec({
    nodeName: 'embedBluesky',
    allowedAttributes: ['src'],
  }),
})
