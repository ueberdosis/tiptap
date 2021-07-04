/// <reference types="cypress" />

import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

describe('editorProps', () => {
  it('editorProps can be set while constructing Editor', () => {
    function transformPastedHTML(html: string) {
      return html
    }

    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
      editorProps: { transformPastedHTML },
    })

    expect(transformPastedHTML)
      .to.eq(editor.options.editorProps.transformPastedHTML)
      .and.to.eq(editor.options.editorProps.transformPastedHTML)
  })

  it('editorProps can be set through setOptions', () => {
    function transformPastedHTML(html: string) {
      return html
    }

    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
    })

    editor.setOptions({ editorProps: { transformPastedHTML } })

    expect(transformPastedHTML)
      .to.eq(editor.options.editorProps.transformPastedHTML)
      .and.to.eq(editor.options.editorProps.transformPastedHTML)
  })

  it('editorProps can be set directly through options', () => {
    function transformPastedHTML(html: string) {
      return html
    }

    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
    })

    editor.options.editorProps.transformPastedHTML = transformPastedHTML

    expect(transformPastedHTML)
      .to.eq(editor.options.editorProps.transformPastedHTML)
      .and.to.eq(editor.options.editorProps.transformPastedHTML)
  })
})
