import { Command, Node, mergeAttributes } from '@tiptap/core'
import { textblockTypeInputRule } from 'prosemirror-inputrules'

type Level = 1 | 2 | 3 | 4 | 5 | 6

export interface HeadingOptions {
  levels: Level[],
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands {
    heading: {
      /**
       * Set a heading node
       */
      setHeading: (attributes: { level: Level }) => Command,
      /**
       * Toggle a heading node
       */
      toggleHeading: (attributes: { level: Level }) => Command,
    }
  }
}

export const Heading = Node.create<HeadingOptions>({
  name: 'heading',

  defaultOptions: {
    levels: [1, 2, 3, 4, 5, 6],
    HTMLAttributes: {},
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

  renderHTML({ node, HTMLAttributes }) {
    const hasLevel = this.options.levels.includes(node.attrs.level)
    const level = hasLevel
      ? node.attrs.level
      : this.options.levels[0]

    return [`h${level}`, mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setHeading: attributes => ({ commands }) => {
        if (!this.options.levels.includes(attributes.level)) {
          return false
        }

        return commands.setNode('heading', attributes)
      },
      toggleHeading: attributes => ({ commands }) => {
        if (!this.options.levels.includes(attributes.level)) {
          return false
        }

        return commands.toggleNode('heading', 'paragraph', attributes)
      },
    }
  },

  addKeyboardShortcuts() {
    return this.options.levels.reduce((items, level) => ({
      ...items,
      ...{
        [`Mod-Alt-${level}`]: () => this.editor.commands.toggleHeading({ level }),
      },
    }), {})
  },

  addInputRules() {
    return this.options.levels.map(level => {
      return textblockTypeInputRule(new RegExp(`^(#{1,${level}})\\s$`), this.type, { level })
    })
  },
})
