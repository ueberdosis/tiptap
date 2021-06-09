import { Mark, mergeAttributes } from '@tiptap/core'

export interface SuperscriptExtensionOptions {
  HTMLAttributes: Object,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    superscript: {
      /**
       * Set a superscript mark
       */
      setSuperscript: () => ReturnType,
      /**
       * Toggle a superscript mark
       */
      toggleSuperscript: () => ReturnType,
      /**
       * Unset a superscript mark
       */
      unsetSuperscript: () => ReturnType,
    }
  }
}

export const Superscript = Mark.create<SuperscriptExtensionOptions>({
  name: 'superscript',

  defaultOptions: {
    HTMLAttributes: {},
  },

  excludes: 'subscript',

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
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['sup', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setSuperscript: () => ({ commands }) => {
        return commands.setMark('superscript')
      },
      toggleSuperscript: () => ({ commands }) => {
        return commands.toggleMark('superscript')
      },
      unsetSuperscript: () => ({ commands }) => {
        return commands.unsetMark('superscript')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-.': () => this.editor.commands.toggleSuperscript(),
    }
  },
})
