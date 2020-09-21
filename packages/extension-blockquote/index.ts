import { Node } from '@tiptap/core'
import { textblockTypeInputRule } from 'prosemirror-inputrules'

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    blockquote(): Editor,
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
  // .commands(({ editor, name }) => ({
  //   [name]: next => attrs => {
  //     editor.toggleNode(name, 'paragraph', attrs)
  //     next()
  //   },
  // }))
  .keys(({ editor }) => ({
    'Shift-Mod-9': () => editor.blockquote(),
  }))
  .inputRules(({ type }) => [
    textblockTypeInputRule(inputRegex, type),
  ])
  .create()


