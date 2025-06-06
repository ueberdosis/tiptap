import { Extension } from '@tiptap/core'
import { dropCursor } from '@tiptap/pm/dropcursor'

export interface DropcursorOptions {
  /**
   * The color of the drop cursor. Use `false` to apply no color and rely only on class.
   * @default 'currentColor'
   * @example 'red'
   */
  color?: string | false

  /**
   * The width of the drop cursor
   * @default 1
   * @example 2
   */
  width: number | undefined

  /**
   * The class of the drop cursor
   * @default undefined
   * @example 'drop-cursor'
   */
  class: string | undefined
}

/**
 * This extension allows you to add a drop cursor to your editor.
 * A drop cursor is a line that appears when you drag and drop content
 * in-between nodes.
 * @see https://tiptap.dev/api/extensions/dropcursor
 */
export const Dropcursor = Extension.create<DropcursorOptions>({
  name: 'dropCursor',

  addOptions() {
    return {
      color: 'currentColor',
      width: 1,
      class: undefined,
    }
  },

  addProseMirrorPlugins() {
    return [dropCursor(this.options)]
  },
})
