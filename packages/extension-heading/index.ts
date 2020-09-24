import { Command, Node } from '@tiptap/core'
import { textblockTypeInputRule } from 'prosemirror-inputrules'

type Level = 1 | 2 | 3 | 4 | 5 | 6

export interface HeadingOptions {
  levels: Level[],
}

export type HeadingCommand = (level: Level) => Command

declare module '@tiptap/core/src/Editor' {
  interface Commands {
    heading: HeadingCommand,
  }
}

export default new Node<HeadingOptions>()
  .name('heading')
  .defaults({
    levels: [1, 2, 3, 4, 5, 6],
  })
  .schema(({ options }) => ({
    attrs: {
      level: {
        default: 1,
      },
    },
    content: 'inline*',
    group: 'block',
    defining: true,
    draggable: false,
    parseDOM: options.levels
      .map((level: Level) => ({
        tag: `h${level}`,
        attrs: { level },
      })),
    toDOM: node => [`h${node.attrs.level}`, 0],
  }))
  .commands(({ name }) => ({
    [name]: attrs => ({ commands }) => {
      return commands.toggleBlockType(name, 'paragraph', attrs)
    },
  }))
  // TODO: Keyboard Shortcuts
  .inputRules(({ options, type }) => {
    return options.levels.map((level: Level) => {
      return textblockTypeInputRule(new RegExp(`^(#{1,${level}})\\s$`), type, { level })
    })
  })
  .create()
