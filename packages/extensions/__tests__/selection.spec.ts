import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Selection } from '@tiptap/extensions'
import { afterEach, describe, expect, it } from 'vitest'

const styleSelector = 'style[data-tiptap-style-selection]'

describe('extension-selection', () => {
  let editor: Editor | null = null

  afterEach(() => {
    if (editor) {
      editor.destroy()
      editor = null
    }

    document.querySelectorAll(styleSelector).forEach(node => node.remove())
  })

  it('injects a stylesheet that hides the native selection while the editor is blurred', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Selection],
      content: '<p>Hello world</p>',
    })

    const styleTag = document.querySelector(styleSelector)

    expect(styleTag).not.toBeNull()
    expect(styleTag?.textContent).toContain('.ProseMirror:not(.ProseMirror-focused) *::selection')
    expect(styleTag?.textContent).toContain('*::-moz-selection')
    expect(styleTag?.textContent).toContain('background: transparent')
  })

  it('does not inject the stylesheet when injectCSS is disabled', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Selection],
      content: '<p>Hello world</p>',
      injectCSS: false,
    })

    expect(document.querySelector(styleSelector)).toBeNull()
  })
})
