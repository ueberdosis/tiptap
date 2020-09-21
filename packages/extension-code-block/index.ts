import { Node } from '@tiptap/core'
import { textblockTypeInputRule } from 'prosemirror-inputrules'

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    codeBlock(): Editor,
  }
}

export default new Node()
  .name('codeBlock')
  .schema(() => ({
    content: 'text*',
    marks: '',
    group: 'block',
    code: true,
    defining: true,
    draggable: false,
    parseDOM: [
      { tag: 'pre', preserveWhitespace: 'full' },
    ],
    toDOM: () => ['pre', ['code', 0]],
  }))
  // .commands(({ editor, name }) => ({
  //   [name]: next => attrs => {
  //     editor.toggleNode(name, 'paragraph', attrs)
  //     next()
  //   },
  // }))
  .keys(({ editor }) => ({
    'Shift-Ctrl-\\': () => editor.codeBlock()
  }))
  .inputRules(({ type }) => [
    textblockTypeInputRule(/^```$/, type),
  ])
  .create()
