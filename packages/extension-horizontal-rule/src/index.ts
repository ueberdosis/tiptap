import { Command, createNode, nodeInputRule } from '@tiptap/core'

const HorizontalRule = createNode({
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
      horizontalRule: (): Command => ({ tr }) => {
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

export default HorizontalRule

declare module '@tiptap/core' {
  interface AllExtensions {
    HorizontalRule: typeof HorizontalRule,
  }
}
