import { Extension } from '@tiptap/core'

export const BackgroundEditor = Extension.create({
  name: 'editorBackground',
  addCommands() {
    return {
      setBackground:
        (url: string) =>
        ({ editor }) => {
          const el = editor.view.dom
          el.style.backgroundImage = `url(${url})`
          el.style.backgroundSize = 'cover'
          return true
        },
    }
  },
})
