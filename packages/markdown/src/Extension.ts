import {
  type InsertContentAtOptions as MarkdownInsertContentAtOptions,
  type InsertContentOptions as MarkdownInsertContentOptions,
  type SetContentOptions as MarkdownSetContentOptions,
  commands,
  Extension,
} from '@tiptap/core'
import type { marked } from 'marked'

import MarkdownManager from './MarkdownManager.js'
import type { ContentType } from './types.js'
import { assumeContentType } from './utils.js'

declare module '@tiptap/core' {
  interface Editor {
    /**
     * Get the content of the editor as markdown.
     */
    getMarkdown: () => string

    /**
     * The markdown manager instance.
     */
    markdown?: MarkdownManager
  }

  interface EditorOptions {
    /**
     * The content type the content is provided as.
     *
     * @default 'json'
     */
    contentType?: ContentType
  }

  interface Storage {
    markdown: MarkdownExtensionStorage
  }

  interface InsertContentOptions {
    /**
     * The content type the content is provided as.
     *
     * @default 'json'
     */
    contentType?: ContentType
  }

  interface InsertContentAtOptions {
    /**
     * The content type the content is provided as.
     *
     * @default 'json'
     */
    contentType?: ContentType
  }

  interface SetContentOptions {
    /**
     * The content type the content is provided as.
     *
     * @default 'json'
     */
    contentType?: ContentType
  }
}

export type MarkdownExtensionOptions = {
  /**
   * Configure the indentation style and size for lists and code blocks.
   * - `style`: Choose between spaces or tabs. Default is 'space'.
   * - `size`: Number of spaces or tabs for indentation. Default is 2.
   */
  indentation?: { style?: 'space' | 'tab'; size?: number }

  /**
   * Use a custom version of `marked` for markdown parsing and serialization.
   * If not provided, the default `marked` instance will be used.
   */
  marked?: typeof marked

  /**
   * Options to pass to `marked.setOptions()`.
   * See the [marked documentation](https://marked.js.org/using_advanced#options) for available options.
   */
  markedOptions?: Parameters<typeof marked.setOptions>[0]
}

export type MarkdownExtensionStorage = {
  manager: MarkdownManager
}

export const Markdown = Extension.create<MarkdownExtensionOptions, MarkdownExtensionStorage>({
  name: 'markdown',

  addOptions() {
    return {
      indentation: { style: 'space', size: 2 },
      marked: undefined,
      markedOptions: {},
    }
  },

  addCommands() {
    return {
      setContent: (content, options?: MarkdownSetContentOptions) => {
        // if no contentType is specified, we assume the content is in JSON format OR HTML format
        if (!options?.contentType) {
          return commands.setContent(content, options)
        }

        const actualContentType = assumeContentType(content, options?.contentType)

        if (actualContentType !== 'markdown' || !this.editor.markdown) {
          return commands.setContent(content, options)
        }

        const mdContent = this.editor.markdown.parse(content as string)
        return commands.setContent(mdContent, options)
      },

      insertContent: (value, options?: MarkdownInsertContentOptions) => {
        // if no contentType is specified, we assume the content is in JSON format OR HTML format
        if (!options?.contentType) {
          return commands.insertContent(value, options)
        }

        const actualContentType = assumeContentType(value, options?.contentType)

        if (actualContentType !== 'markdown' || !this.editor.markdown) {
          return commands.insertContent(value, options)
        }

        const mdContent = this.editor.markdown.parse(value as string)
        return commands.insertContent(mdContent, options)
      },

      insertContentAt: (position, value, options?: MarkdownInsertContentAtOptions) => {
        // if no contentType is specified, we assume the content is in JSON format OR HTML format
        if (!options?.contentType) {
          return commands.insertContentAt(position, value, options)
        }

        const actualContentType = assumeContentType(value, options?.contentType)

        if (actualContentType !== 'markdown' || !this.editor.markdown) {
          return commands.insertContentAt(position, value, options)
        }

        const mdContent = this.editor.markdown.parse(value as string)
        return commands.insertContentAt(position, mdContent, options)
      },
    }
  },

  addStorage() {
    return {
      manager: new MarkdownManager({
        indentation: this.options.indentation,
        marked: this.options.marked,
        markedOptions: this.options.markedOptions,
        extensions: [],
      }),
    }
  },

  onBeforeCreate() {
    if (this.editor.markdown) {
      console.error(
        '[tiptap][markdown]: There is already a `markdown` property on the editor instance. This might lead to unexpected behavior.',
      )
      return
    }

    this.storage.manager = new MarkdownManager({
      indentation: this.options.indentation,
      marked: this.options.marked,
      markedOptions: this.options.markedOptions,
      extensions: this.editor.extensionManager.baseExtensions,
    })

    this.editor.markdown = this.storage.manager

    // add a `getMarkdown()` method to the editor
    this.editor.getMarkdown = () => {
      return this.storage.manager.serialize(this.editor.getJSON())
    }

    if (!this.editor.options.contentType) {
      return
    }

    const assumedType = assumeContentType(this.editor.options.content, this.editor.options.contentType)
    if (assumedType !== 'markdown') {
      return
    }

    if (!this.editor.markdown) {
      throw new Error(
        '[tiptap][markdown]: The `contentType` option is set to "markdown", but the Markdown extension is not added to the editor. Please add the Markdown extension to use this feature.',
      )
    }

    if (this.editor.options.content === undefined || typeof this.editor.options.content !== 'string') {
      throw new Error(
        '[tiptap][markdown]: The `contentType` option is set to "markdown", but the initial content is not a string. Please provide the initial content as a markdown string.',
      )
    }

    const json = this.editor.markdown.parse(this.editor.options.content as string)
    this.editor.options.content = json
  },
})
