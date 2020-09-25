import { Command, Node } from '@tiptap/core'
import { textblockTypeInputRule } from 'prosemirror-inputrules'

type Level = 1 | 2 | 3 | 4 | 5 | 6

export interface HeadingOptions {
  levels: Level[],
}

export type HeadingCommand = (options: { level: Level }) => Command

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
    heading: attrs => ({ commands }) => {
      return commands.toggleBlockType(name, 'paragraph', attrs)
    },
  }))
  .keys(({ name, options, editor }) => {
    return options.levels.reduce((items, level) => ({
      ...items,
      ...{
        [`Mod-Alt-${level}`]: () => editor.setBlockType(name, { level }),
      },
    }), {})
  })
  .inputRules(({ options, type }) => {
    return options.levels.map((level: Level) => {
      return textblockTypeInputRule(new RegExp(`^(#{1,${level}})\\s$`), type, { level })
    })
  })
  .create()
