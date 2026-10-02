import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { Editor } from './Editor.js'
import { PasteRule, pasteRulesPlugin } from './PasteRule.js'

describe('PasteRule plugin', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('attaches global drag and drop listeners', () => {
    const editorEl = document.createElement('div')
    document.body.appendChild(editorEl)

    editor = new Editor({
      element: editorEl,
      extensions: [Document, Paragraph, Text],
    })

    const rule = new PasteRule({
      find: /test/,
      handler: () => null,
    })

    const plugins = pasteRulesPlugin({ editor, rules: [rule] })
    expect(plugins.length).toBe(1)

    // The plugin view should not throw when created and destroyed
    const view = plugins[0].spec.view!(editor.view)

    // Simulate drop on window to ensure it doesn't throw
    const dropEvent = new Event('drop')
    window.dispatchEvent(dropEvent)

    view.destroy!()
  })
})
