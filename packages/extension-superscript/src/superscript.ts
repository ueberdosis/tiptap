import { Mark, mergeAttributes } from '@tiptap/core'
import type { StyleParseRule } from '@tiptap/pm/model'

export interface SuperscriptExtensionOptions {
  /**
   * HTML attributes to add to the superscript element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    superscript: {
      /**
       * Set a superscript mark
       * @example editor.commands.setSuperscript()
       */
      setSuperscript: () => ReturnType,
      /**
       * Toggle a superscript mark
       * @example editor.commands.toggleSuperscript()
       */
      toggleSuperscript: () => ReturnType,
      /**
       * Unset a superscript mark
       *  @example editor.commands.unsetSuperscript()
       */
      unsetSuperscript: () => ReturnType,
    }
  }
}

/**
 * This extension allows you to create superscript text.
 * @see https://www.tiptap.dev/api/marks/superscript
 */
export const Superscript = Mark.create<SuperscriptExtensionOptions>({
  name: 'superscript',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      {
        tag: 'sup',
      },
      {
        style: 'vertical-align',
        getAttrs(value) {
          // Don’t match this rule if the vertical align isn’t super.
          if (value !== 'super') {
            return false
          }

          // If it falls through we’ll match, and this mark will be applied.
          return null
        },
      } as StyleParseRule,
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['sup', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setSuperscript: () => ({ commands }) => {
        return commands.setMark(this.name)
      },
      toggleSuperscript: () => ({ commands }) => {
        return commands.toggleMark(this.name)
      },
      unsetSuperscript: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-.': () => this.editor.commands.toggleSuperscript(),
    }
  },
})
