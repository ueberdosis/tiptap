import { Command, createNode } from '@tiptap/core'
import { textblockTypeInputRule } from 'prosemirror-inputrules'

type Level = 1 | 2 | 3 | 4 | 5 | 6

export interface HeadingOptions {
  levels: Level[],
}

// export type HeadingCommand = (options: { level: Level }) => Command

// declare module '@tiptap/core/src/Editor' {
//   interface Commands {
//     heading: HeadingCommand,
//   }
// }

export default createNode({
  name: 'heading',

  defaultOptions: <HeadingOptions>{
    levels: [1, 2, 3, 4, 5, 6],
  },

  content: 'inline*',

  group: 'block',

  defining: true,

  addAttributes() {
    return {
      level: {
        default: 1,
        rendered: false,
      },
    }
  },

  parseHTML() {
    return this.options.levels
      .map((level: Level) => ({
        tag: `h${level}`,
        attrs: { level },
      }))
  },

  renderHTML({ node, attributes }) {
    return [`h${node.attrs.level}`, attributes, 0]
  },

  addCommands() {
    return {
      heading: attrs => ({ commands }) => {
        return commands.toggleBlockType('heading', 'paragraph', attrs)
      },
    }
  },

  addKeyboardShortcuts() {
    return this.options.levels.reduce((items, level) => ({
      ...items,
      ...{
        [`Mod-Alt-${level}`]: () => this.editor.setBlockType('heading', { level }),
      },
    }), {})
  },

  addInputRules() {
    return this.options.levels.map(level => {
      return textblockTypeInputRule(new RegExp(`^(#{1,${level}})\\s$`), this.type, { level })
    })
  },
})
