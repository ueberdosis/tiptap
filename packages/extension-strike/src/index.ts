import {
  Command,
  Mark,
  markInputRule,
  markPasteRule,
} from '@tiptap/core'

export interface StrikeOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

export const inputRegex = /(?:^|\s)((?:~~)((?:[^~]+))(?:~~))$/gm
export const pasteRegex = /(?:^|\s)((?:~~)((?:[^~]+))(?:~~))/gm

const Strike = Mark.create({
  name: 'strike',

  defaultOptions: <StrikeOptions>{
    HTMLAttributes: {},
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
        style: 'text-decoration=line-through',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['s', HTMLAttributes, 0]
  },

  addCommands() {
    return {
      /**
       * Add a strike mark
       */
      addStrike: (): Command => ({ commands }) => {
        return commands.addMark('strike')
      },
      /**
       * Toggle a strike mark
       */
      toggleStrike: (): Command => ({ commands }) => {
        return commands.toggleMark('strike')
      },
      /**
       * Remove a strike mark
       */
      removeStrike: (): Command => ({ commands }) => {
        return commands.addMark('strike')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-d': () => this.editor.commands.toggleStrike(),
    }
  },

  addInputRules() {
    return [
      markInputRule(inputRegex, this.type),
    ]
  },

  addPasteRules() {
    return [
      markPasteRule(inputRegex, this.type),
    ]
  },
})

export default Strike

declare module '@tiptap/core' {
  interface AllExtensions {
    Strike: typeof Strike,
  }
}
