import { Command, Node, nodeInputRule } from '@tiptap/core'

export type HorizontalRuleCommand = () => Command

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    horizontalRule: HorizontalRuleCommand,
  }
}

export default new Node()
  .name('horizontalRule')
  .schema(() => ({
    group: 'block',
    parseDOM: [{ tag: 'hr' }],
    toDOM: () => ['hr'],
  }))
  .commands(({ type }) => ({
    horizontalRule: () => ({ tr }) => {
      tr.replaceSelectionWith(type.create())

      return true
    },
  }))
  .inputRules(({ type }) => [
    nodeInputRule(/^(?:---|___\s|\*\*\*\s)$/, type),
  ])
  .create()
