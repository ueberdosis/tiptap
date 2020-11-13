import { Command, createNode } from '@tiptap/core'
import { textblockTypeInputRule } from 'prosemirror-inputrules'

type Level = 1 | 2 | 3 | 4 | 5 | 6

export interface HeadingOptions {
  levels: Level[],
}

const Heading = createNode({
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
    const hasLevel = this.options.levels.includes(node.attrs.level)
    const level = hasLevel
      ? node.attrs.level
      : this.options.levels[0]

    return [`h${level}`, attributes, 0]
  },

  addCommands() {
    return {
      /**
       * Toggle a heading node
       */
      heading: (options: { level: Level }): Command => ({ commands }) => {
        if (!this.options.levels.includes(options.level)) {
          return false
        }

        return commands.toggleBlockType('heading', 'paragraph', options)
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

export default Heading

declare module '@tiptap/core' {
  interface AllExtensions {
    Heading: typeof Heading,
  }
}
