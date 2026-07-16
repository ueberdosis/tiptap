import { Extension } from '@tiptap/core'

import { Editor, useEditor } from '../src/index.js'

const VueCommands = Extension.create({
  name: 'vueCommands',

  addCommands() {
    return {
      setVueValue: (value: string) => () => {
        return value.length > 0
      },
    }
  },
})

const editor = useEditor({
  extensions: [VueCommands],
})

editor.value?.commands.setVueValue('value')
editor.value?.chain().setVueValue('value').run()
editor.value?.can().setVueValue('value')

const directEditor = new Editor({
  extensions: [VueCommands],
})

directEditor.commands.setVueValue('value')

// @ts-expect-error The inferred command requires a string value.
editor.value?.commands.setVueValue(1)
