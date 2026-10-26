import { Editor as CoreEditor } from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import * as Y from 'yjs'

import { Editor } from '../../src/Editor.js'

const dispose: (() => void)[] = []

afterEach(() => {
  dispose.splice(0).forEach(cleanup => cleanup())
})

describe('collaboration undo and redo', () => {
  it.each([
    ['core', CoreEditor],
    ['Vue 3', Editor],
  ] as const)(
    'preserves undo and redo after plugin registration and removal in %s',
    (_name, EditorClass) => {
      const document = new Y.Doc()
      const editor = new EditorClass({
        extensions: [Document, Paragraph, Text, Collaboration.configure({ document })],
      })

      dispose.push(() => {
        editor.destroy()
        document.destroy()
      })

      editor.commands.insertContent('Hello')

      const key = new PluginKey('toolbar')
      editor.registerPlugin(new Plugin({ key }))
      editor.unregisterPlugin(key)

      expect(editor.getText()).toBe('Hello')
      expect(editor.commands.undo()).toBe(true)
      expect(editor.getText()).toBe('')
      expect(editor.commands.redo()).toBe(true)
      expect(editor.getText()).toBe('Hello')
    },
  )
})
