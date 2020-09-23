import { Command, Node } from '@tiptap/core'
import { textblockTypeInputRule } from 'prosemirror-inputrules'

export type CodeBlockCommand = () => Command

declare module '@tiptap/core/src/Editor' {
  interface Commands {
    codeBlock: CodeBlockCommand,
  }
}

export default new Node()
  .name('code_block')
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
  .commands(({ name }) => ({
    codeBlock: attrs => ({ commands }) => {
      return commands.toggleNode(name, 'paragraph', attrs)
    },
  }))
  .keys(({ editor }) => ({
    'Shift-Ctrl-\\': () => editor.codeBlock()
  }))
  .inputRules(({ type }) => [
    textblockTypeInputRule(/^```$/, type),
  ])
  .create()
