import { Node, CommandSpec } from '@tiptap/core'
import { NodeSpec } from 'prosemirror-model'
import VerEx from 'verbal-expressions'
import { textblockTypeInputRule } from 'prosemirror-inputrules'

type Level = 1 | 2 | 3 | 4 | 5 | 6

interface HeadingOptions {
  levels?: Level[],
}

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    heading(level: Level): Editor,
  }
}

export default class Heading extends Node {

  name = 'heading'

  defaultOptions(): HeadingOptions {
    return {
      levels: [1, 2, 3, 4, 5, 6],
    }
  }

  schema(): NodeSpec {
    return {
      attrs: {
        level: {
          default: 1,
        },
      },
      content: 'inline*',
      group: 'block',
      defining: true,
      draggable: false,
      parseDOM: this.options.levels
        .map((level: Level) => ({
          tag: `h${level}`,
          attrs: { level },
        })),
      toDOM: node => [`h${node.attrs.level}`, 0],
    }
  }

  commands(): CommandSpec {
    return {
      heading: next => attrs => {
        this.editor.toggleNode(this.name, 'paragraph', attrs)
        next()
      },
    }
  }

  inputRules() {
    return this.options.levels.map((level: Level) => {
      const regex = VerEx()
        .startOfLine()
        .find('#')
        .repeatPrevious(level)
        .whitespace()
        .endOfLine()

      return textblockTypeInputRule(regex, this.type, { level })
    })
  }

}