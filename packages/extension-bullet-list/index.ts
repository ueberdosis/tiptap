import { Command, Node } from '@tiptap/core'
import { wrappingInputRule } from 'prosemirror-inputrules'

export type BulletListCommand = () => Command

declare module '@tiptap/core/src/Editor' {
  interface Commands {
    bulletList: BulletListCommand,
  }
}

export default new Node()
  .name('bullet_list')
  .schema(() => ({
    content: 'list_item+',
    group: 'block',
    parseDOM: [
      { tag: 'ul' },
    ],
    toDOM: () => ['ul', 0],
  }))
  .commands(({ name }) => ({
    bulletList: () => ({ commands }) => {
      return commands.toggleList(name, 'list_item')
    },
  }))
  .keys(({ editor }) => ({
    'Shift-Ctrl-8': () => editor.bulletList(),
  }))
  .inputRules(({ type }) => [
    wrappingInputRule(/^\s*([-+*])\s$/, type),
  ])
  .create()
