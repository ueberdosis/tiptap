import { Mark, mergeAttributes } from '@tiptap/core'

export interface SubscriptExtensionOptions {
  HTMLAttributes: Object,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    subscript: {
      /**
       * Set a subscript mark
       */
      setSubscript: () => ReturnType,
      /**
       * Toggle a subscript mark
       */
      toggleSubscript: () => ReturnType,
      /**
       * Unset a subscript mark
       */
      unsetSubscript: () => ReturnType,
    }
  }
}

export const Subscript = Mark.create<SubscriptExtensionOptions>({
  name: 'subscript',

  defaultOptions: {
    HTMLAttributes: {},
  },

  excludes: 'superscript',

  parseHTML() {
    return [
      {
        tag: 'sub',
      },
      {
        style: 'vertical-align',
        getAttrs(value) {
          // Don’t match this rule if the vertical align isn’t sub.
          if (value !== 'sub') {
            return false
          }

          // If it falls through we’ll match, and this mark will be applied.
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['sub', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setSubscript: () => ({ commands }) => {
        return commands.setMark('subscript')
      },
      toggleSubscript: () => ({ commands }) => {
        return commands.toggleMark('subscript')
      },
      unsetSubscript: () => ({ commands }) => {
        return commands.unsetMark('subscript')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-,': () => this.editor.commands.toggleSubscript(),
    }
  },
})
