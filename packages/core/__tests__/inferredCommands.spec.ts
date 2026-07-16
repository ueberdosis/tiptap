import { Editor, Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

let receivedValue: { value: string; repeat: number } | undefined

const InferredCommands = Extension.create({
  name: 'inferredCommands',

  addCommands() {
    return {
      setInferredValue:
        (value: string, repeat: number = 1) =>
        () => {
          receivedValue = { value, repeat }

          return true
        },
    }
  },
})

describe('inferred commands', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('should receive inferred command arguments', () => {
    receivedValue = undefined
    editor = new Editor({
      extensions: [Document, Paragraph, Text, InferredCommands],
    })

    editor.commands.setInferredValue('value', 2)

    expect(receivedValue).toEqual({
      value: 'value',
      repeat: 2,
    })
  })
})
