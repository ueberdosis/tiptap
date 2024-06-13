import {
  Mark,
  markInputRule,
  markPasteRule,
  mergeAttributes,
} from '@tiptap/core'

export interface StrikeOptions {
  /**
   * HTML attributes to add to the strike element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    strike: {
      /**
       * Set a strike mark
       * @example editor.commands.setStrike()
       */
      setStrike: () => ReturnType,
      /**
       * Toggle a strike mark
       * @example editor.commands.toggleStrike()
       */
      toggleStrike: () => ReturnType,
      /**
       * Unset a strike mark
       * @example editor.commands.unsetStrike()
       */
      unsetStrike: () => ReturnType,
    }
  }
}

/**
 * Matches a strike to a ~~strike~~ on input.
 */
export const inputRegex = /(?:^|\s)(~~(?!\s+~~)((?:[^~]+))~~(?!\s+~~))$/

/**
 * Matches a strike to a ~~strike~~ on paste.
 */
export const pasteRegex = /(?:^|\s)(~~(?!\s+~~)((?:[^~]+))~~(?!\s+~~))/g

/**
 * This extension allows you to create strike text.
 * @see https://www.tiptap.dev/api/marks/strike
 */
export const Strike = Mark.create<StrikeOptions>({
  name: 'strike',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      {
        tag: 's',
      },
      {
        tag: 'del',
      },
      {
        tag: 'strike',
      },
      {
        style: 'text-decoration',
        consuming: false,
        getAttrs: style => ((style as string).includes('line-through') ? {} : false),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['s', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setStrike: () => ({ commands }) => {
        return commands.setMark(this.name)
      },
      toggleStrike: () => ({ commands }) => {
        return commands.toggleMark(this.name)
      },
      unsetStrike: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-s': () => this.editor.commands.toggleStrike(),
    }
  },

  addInputRules() {
    return [
      markInputRule({
        find: inputRegex,
        type: this.type,
      }),
    ]
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: pasteRegex,
        type: this.type,
      }),
    ]
  },
})
