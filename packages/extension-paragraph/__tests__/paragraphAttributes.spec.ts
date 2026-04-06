import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

describe('paragraph spacing attributes', () => {
  const editorElClass = 'tiptap-paragraph-attrs'
  let editor: Editor | null = null

  const createEditorEl = () => {
    const editorEl = document.createElement('div')

    editorEl.classList.add(editorElClass)
    document.body.appendChild(editorEl)
    return editorEl
  }

  const getEditorEl = () => document.querySelector(`.${editorElClass}`)

  const createEditor = (content: string) => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [Document, Text, Paragraph],
      content,
    })
    return editor
  }

  const getFirstParagraphAttrs = () => {
    const json = editor!.getJSON()

    return json.content[0].attrs
  }

  const getFirstParagraphElement = () => {
    return getEditorEl()?.querySelector('p')
  }

  afterEach(() => {
    editor?.destroy()
    getEditorEl()?.remove()
    editor = null
  })

  describe('spacingBefore', () => {
    it('should parse margin-top from inline style', () => {
      createEditor('<p style="margin-top: 28px">Hello</p>')

      expect(getFirstParagraphAttrs().spacingBefore).toBe(28)
    })

    it('should render margin-top as inline style', () => {
      createEditor('<p style="margin-top: 28px">Hello</p>')

      expect(getFirstParagraphElement()?.style.marginTop).toBe('28px')
    })

    it('should default to null', () => {
      createEditor('<p>Hello</p>')

      expect(getFirstParagraphAttrs().spacingBefore).toBeNull()
    })
  })

  describe('spacingAfter', () => {
    it('should parse margin-bottom from inline style', () => {
      createEditor('<p style="margin-bottom: 13px">Hello</p>')

      expect(getFirstParagraphAttrs().spacingAfter).toBe(13)
    })

    it('should render margin-bottom as inline style', () => {
      createEditor('<p style="margin-bottom: 13px">Hello</p>')

      expect(getFirstParagraphElement()?.style.marginBottom).toBe('13px')
    })

    it('should default to null', () => {
      createEditor('<p>Hello</p>')

      expect(getFirstParagraphAttrs().spacingAfter).toBeNull()
    })
  })

  describe('lineHeight', () => {
    it('should parse line-height as a string from inline style', () => {
      createEditor('<p style="line-height: 1.5">Hello</p>')

      expect(getFirstParagraphAttrs().lineHeight).toBe('1.5')
    })

    it('should render line-height as inline style', () => {
      createEditor('<p style="line-height: 1.5">Hello</p>')

      expect(getFirstParagraphElement()?.style.lineHeight).toBe('1.5')
    })

    it('should default to null', () => {
      createEditor('<p>Hello</p>')

      expect(getFirstParagraphAttrs().lineHeight).toBeNull()
    })
  })

  describe('indent', () => {
    it('should parse padding-left from inline style', () => {
      createEditor('<p style="padding-left: 48px">Hello</p>')

      expect(getFirstParagraphAttrs().indent).toBe(48)
    })

    it('should render padding-left as inline style', () => {
      createEditor('<p style="padding-left: 48px">Hello</p>')

      expect(getFirstParagraphElement()?.style.paddingLeft).toBe('48px')
    })

    it('should default to null', () => {
      createEditor('<p>Hello</p>')

      expect(getFirstParagraphAttrs().indent).toBeNull()
    })
  })

  describe('firstLineIndent', () => {
    it('should parse text-indent from inline style', () => {
      createEditor('<p style="text-indent: 32px">Hello</p>')

      expect(getFirstParagraphAttrs().firstLineIndent).toBe(32)
    })

    it('should render text-indent as inline style', () => {
      createEditor('<p style="text-indent: 32px">Hello</p>')

      expect(getFirstParagraphElement()?.style.textIndent).toBe('32px')
    })

    it('should default to null', () => {
      createEditor('<p>Hello</p>')

      expect(getFirstParagraphAttrs().firstLineIndent).toBeNull()
    })
  })

  describe('round-trip', () => {
    it('should round-trip all spacing attributes via JSON', () => {
      createEditor(
        '<p style="margin-top: 28px; margin-bottom: 13px; line-height: 1.6; padding-left: 48px; text-indent: 32px">Hello</p>',
      )

      const json = editor!.getJSON()

      editor!.commands.setContent(json)

      const attrs = getFirstParagraphAttrs()

      expect(attrs.spacingBefore).toBe(28)
      expect(attrs.spacingAfter).toBe(13)
      expect(attrs.lineHeight).toBe('1.6')
      expect(attrs.indent).toBe(48)
      expect(attrs.firstLineIndent).toBe(32)
    })
  })
})
