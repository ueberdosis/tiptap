import { Command, createNode, nodeInputRule } from '@tiptap/core'

// export type HorizontalRuleCommand = () => Command

// declare module '@tiptap/core/src/Editor' {
//   interface Commands {
//     horizontalRule: HorizontalRuleCommand,
//   }
// }

export default createNode({
  name: 'horizontalRule',

  group: 'block',

  parseHTML() {
    return [
      { tag: 'hr' },
    ]
  },

  renderHTML({ attributes }) {
    return ['hr', attributes]
  },

  addCommands() {
    return {
      horizontalRule: () => ({ tr }) => {
        tr.replaceSelectionWith(this.type.create())

        return true
      },
    }
  },

  addInputRules() {
    return [
      nodeInputRule(/^(?:---|___\s|\*\*\*\s)$/, this.type),
    ]
  },
})
