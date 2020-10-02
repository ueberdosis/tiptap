import {
  Command, Mark,
} from '@tiptap/core'

export type HighlightCommand = () => Command

declare module '@tiptap/core/src/Editor' {
  interface Commands {
    highlight: HighlightCommand,
  }
}

export default new Mark()
  .name('highlight')
  .schema(() => ({
    parseDOM: [
      {
        tag: 'mark',
      },
    ],
    toDOM: () => ['mark', 0],
  }))
  .commands(({ name }) => ({
    highlight: () => ({ commands }) => {
      return commands.toggleMark(name)
    },
  }))
  .keys(({ editor }) => ({
    'Mod-e': () => editor.highlight(),
  }))
  .create()
