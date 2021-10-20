import { Mark } from '@tiptap/core'

export interface AbbreviationOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    abbreviation: {
      /**
       * Set an abbreviation mark
       */
      setAbbreviation: (title?: string) => ReturnType,
      /**
       * Toggle an abbreviation mark
       */
      toggleAbbreviation: (title?: string) => ReturnType,
      /**
       * Unset an abbreviation mark
       */
      unsetAbbreviation: () => ReturnType,
    }
  }
}

export const Abbreviation = Mark.create<AbbreviationOptions>({
  name: 'abbreviation',

  defaultOptions: {
    HTMLAttributes: {},
  },

  addAttributes() {
    return {
      title: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'abbr',
      },
      {
        tag: 'acronym',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['abbr', HTMLAttributes, 0]
  },

  addCommands() {
    return {
      setAbbreviation: title => ({ commands }) => {
        return commands.setMark('abbreviation', {
          title,
        })
      },
      toggleAbbreviation: title => ({ commands }) => {
        return commands.toggleMark('abbreviation', {
          title,
        })
      },
      unsetAbbreviation: () => ({ commands }) => {
        return commands.unsetMark('abbreviation')
      },
    }
  },
})
