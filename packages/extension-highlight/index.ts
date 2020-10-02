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
    attrs: {
      color: {
        default: null,
      },
    },
    parseDOM: [
      {
        tag: 'mark',
        getAttrs: node => {
          return {
            color: (node as HTMLElement).style.backgroundColor,
          }
        },
      },
    ],
    toDOM: node => ['mark', {
      ...node.attrs,
      style: node.attrs.color && `background-color: ${node.attrs.color};`,
    }, 0],
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
