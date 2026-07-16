import { Extension } from '@tiptap/core'

import { Editor } from '../src/index.js'

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

const editor = new Editor({
  extensions: [VueCommands],
})

editor.commands.setVueValue('value')

// @ts-expect-error The inferred command requires a string value.
editor.commands.setVueValue(1)
