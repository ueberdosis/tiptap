import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'

export default Extension.create({
  name: 'mention',

  defaultOptions: {
    suggestion: {
      char: '/',
      startOfLine: true,
      command: ({ editor, range, attributes }) => {
        attributes.command({ editor, range })
      },
    },
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})
