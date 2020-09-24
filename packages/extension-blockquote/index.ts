import { Command, Node } from '@tiptap/core'
import { textblockTypeInputRule } from 'prosemirror-inputrules'

export type BlockquoteCommand = () => Command

declare module '@tiptap/core/src/Editor' {
  interface Commands {
    blockquote: BlockquoteCommand,
  }
}

export const inputRegex = /^\s*>\s$/gm

export default new Node()
  .name('blockquote')
  .schema(() => ({
    content: 'inline*',
    group: 'block',
    defining: true,
    draggable: false,
    parseDOM: [
      { tag: 'blockquote' },
    ],
    toDOM: () => ['blockquote', 0],
  }))
  .commands(({ name }) => ({
    [name]: attrs => ({ commands }) => {
      return commands.toggleNode(name, 'paragraph', attrs)
    },
  }))
  .keys(({ editor }) => ({
    'Shift-Mod-9': () => editor.blockquote(),
  }))
  .inputRules(({ type }) => [
    textblockTypeInputRule(inputRegex, type),
  ])
  .create()
