import { Extension } from '@tiptap/core'

import { useEditor } from '../src/index.js'

const ReactCommands = Extension.create({
  name: 'reactCommands',

  addCommands() {
    return {
      setReactValue: (value: string) => () => {
        return value.length > 0
      },
    }
  },
})

const editor = useEditor({
  extensions: [ReactCommands],
})

editor.commands.setReactValue('value')
editor.chain().setReactValue('value').run()
editor.can().setReactValue('value')

// @ts-expect-error The inferred command requires a string value.
editor.commands.setReactValue(1)
