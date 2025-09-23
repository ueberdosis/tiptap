import {
  type InsertContentAtOptions as MarkdownInsertContentAtOptions,
  type InsertContentOptions as MarkdownInsertContentOptions,
  type SetContentOptions as MarkdownSetContentOptions,
  Extension,
  insertContent,
  insertContentAt,
  setContent,
} from '@tiptap/core'
import type { marked } from 'marked'

import MarkdownManager from './MarkdownManager.js'

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
     * If set to true, the content will be parsed as markdown before inserting or setting.
     */
    contentAsMarkdown?: boolean
  }

  interface Storage {
    markdown: MarkdownExtensionStorage
  }

  interface InsertContentOptions {
    /**
     * Whether the content is provided as markdown.
     * If true, the content will be parsed to JSON before inserting.
     * @default false
     */
    asMarkdown?: boolean
  }

  interface InsertContentAtOptions {
    /**
     * Whether the content is provided as markdown.
     * If true, the content will be parsed to JSON before inserting.
     * @default false
     */
    asMarkdown?: boolean
  }

  interface SetContentOptions {
    /**
     * Whether the content is provided as markdown.
     * If true, the content will be parsed to JSON before setting.
     * @default false
     */
    asMarkdown?: boolean
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
        if (options?.asMarkdown && this.editor.markdown && typeof content === 'string') {
          content = this.editor.markdown.parse(content as string)
        }

        return setContent(content, options)
      },

      insertContent: (value, options?: MarkdownInsertContentOptions) => {
        if (options?.asMarkdown && this.editor.markdown && typeof value === 'string') {
          value = this.editor.markdown.parse(value as string)
        }

        return insertContent(value, options)
      },

      insertContentAt: (position, value, options?: MarkdownInsertContentAtOptions) => {
        if (options?.asMarkdown && this.editor.markdown && typeof value === 'string') {
          value = this.editor.markdown.parse(value as string)
        }

        return insertContentAt(position, value, options)
      },
    }
  },

  addStorage() {
    return {
      manager: new MarkdownManager({
        indentation: this.options.indentation,
        marked: this.options.marked,
        markedOptions: this.options.markedOptions,
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

    this.editor.markdown = this.storage.manager

    if (!this.editor.options.contentAsMarkdown) {
      return
    }

    if (!this.editor.markdown) {
      console.error(
        '[tiptap][markdown]: The `contentAsMarkdown` option is set to true, but the Markdown extension is not added to the editor. Please add the Markdown extension to use this feature.',
      )
      return
    }

    if (!this.editor.options.content || typeof this.editor.options.content !== 'string') {
      console.error(
        '[tiptap][markdown]: The `contentAsMarkdown` option is set to true, but the initial content is not a string. Please provide the initial content as a markdown string.',
      )
      return
    }

    const json = this.editor.markdown.parse(this.editor.options.content as string)
    this.editor.options.content = json
  },

  onCreate() {
    if (this.editor.markdown) {
      return
    }

    // register all extensions that have markdown config
    this.editor.extensionManager.extensions.forEach(extension => {
      if (extension.config.markdown) {
        this.storage.manager.registerExtension(extension)
      }
    })

    // add a `getMarkdown()` method to the editor
    this.editor.getMarkdown = () => {
      return this.storage.manager.serialize(this.editor.getJSON())
    }

    // update commands
  },
})
