import { Node } from '@tiptap/core'
import { wrappingInputRule } from 'prosemirror-inputrules'

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    bulletList(): Editor,
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
  .commands(({ editor, type }) => ({
    [name]: next => attrs => {
      // editor.toggleList(type, editor.schema.nodes.list_item)
      next()
    },
  }))
  .keys(({ editor }) => ({
    'Shift-Ctrl-8': () => editor.bulletList(),
  }))
  .inputRules(({ type }) => [
    wrappingInputRule(/^\s*([-+*])\s$/, type),
  ])
  .create()
