import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

describe('heading spacing attributes', () => {
  const editorElClass = 'tiptap-heading-attrs'
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
      extensions: [Document, Text, Paragraph, Heading],
      content,
    })
    return editor
  }

  const getFirstHeadingAttrs = () => {
    const json = editor!.getJSON()

    return json.content[0].attrs
  }

  const getFirstHeadingElement = () => {
    return getEditorEl()?.querySelector('h1, h2, h3, h4, h5, h6')
  }

  afterEach(() => {
    editor?.destroy()
    getEditorEl()?.remove()
    editor = null
  })

  describe('spacingBefore', () => {
    it('should parse margin-top from inline style on h1', () => {
      createEditor('<h1 style="margin-top: 56px">Title</h1>')

      expect(getFirstHeadingAttrs().spacingBefore).toBe(56)
    })

    it('should render margin-top as inline style', () => {
      createEditor('<h1 style="margin-top: 56px">Title</h1>')

      expect(getFirstHeadingElement()?.getAttribute('style')).toContain('margin-top: 56px')
    })

    it('should default to null', () => {
      createEditor('<h1>Title</h1>')

      expect(getFirstHeadingAttrs().spacingBefore).toBeNull()
    })
  })

  describe('spacingAfter', () => {
    it('should parse margin-bottom from inline style on h2', () => {
      createEditor('<h2 style="margin-bottom: 24px">Subtitle</h2>')

      expect(getFirstHeadingAttrs().spacingAfter).toBe(24)
    })

    it('should render margin-bottom as inline style', () => {
      createEditor('<h2 style="margin-bottom: 24px">Subtitle</h2>')

      expect(getFirstHeadingElement()?.getAttribute('style')).toContain('margin-bottom: 24px')
    })

    it('should default to null', () => {
      createEditor('<h2>Subtitle</h2>')

      expect(getFirstHeadingAttrs().spacingAfter).toBeNull()
    })
  })

  describe('lineHeight', () => {
    it('should parse line-height from inline style', () => {
      createEditor('<h1 style="line-height: 1.3">Title</h1>')

      expect(getFirstHeadingAttrs().lineHeight).toBe(1.3)
    })

    it('should render multiplier line-height without units', () => {
      createEditor('<h1 style="line-height: 1.3">Title</h1>')

      expect(getFirstHeadingElement()?.getAttribute('style')).toContain('line-height: 1.3')
    })

    it('should default to null', () => {
      createEditor('<h1>Title</h1>')

      expect(getFirstHeadingAttrs().lineHeight).toBeNull()
    })
  })

  describe('indent', () => {
    it('should parse padding-left from inline style', () => {
      createEditor('<h3 style="padding-left: 48px">Indented heading</h3>')

      expect(getFirstHeadingAttrs().indent).toBe(48)
    })

    it('should render padding-left as inline style', () => {
      createEditor('<h3 style="padding-left: 48px">Indented heading</h3>')

      expect(getFirstHeadingElement()?.getAttribute('style')).toContain('padding-left: 48px')
    })

    it('should default to null', () => {
      createEditor('<h3>Heading</h3>')

      expect(getFirstHeadingAttrs().indent).toBeNull()
    })
  })

  describe('firstLineIndent', () => {
    it('should parse text-indent from inline style', () => {
      createEditor('<h1 style="text-indent: 32px">Title</h1>')

      expect(getFirstHeadingAttrs().firstLineIndent).toBe(32)
    })

    it('should render text-indent as inline style', () => {
      createEditor('<h1 style="text-indent: 32px">Title</h1>')

      expect(getFirstHeadingElement()?.getAttribute('style')).toContain('text-indent: 32px')
    })

    it('should default to null', () => {
      createEditor('<h1>Title</h1>')

      expect(getFirstHeadingAttrs().firstLineIndent).toBeNull()
    })
  })

  describe('coexistence with level attribute', () => {
    it('should preserve heading level alongside spacing attributes', () => {
      createEditor('<h3 style="margin-top: 20px; margin-bottom: 10px">Heading 3</h3>')

      const attrs = getFirstHeadingAttrs()

      expect(attrs.level).toBe(3)
      expect(attrs.spacingBefore).toBe(20)
      expect(attrs.spacingAfter).toBe(10)
    })
  })

  describe('round-trip', () => {
    it('should round-trip all spacing attributes via JSON', () => {
      createEditor(
        '<h1 style="margin-top: 56px; margin-bottom: 24px; line-height: 1.3; padding-left: 48px; text-indent: 32px">Title</h1>',
      )

      const json = editor!.getJSON()

      editor!.commands.setContent(json)

      const attrs = getFirstHeadingAttrs()

      expect(attrs.level).toBe(1)
      expect(attrs.spacingBefore).toBe(56)
      expect(attrs.spacingAfter).toBe(24)
      expect(attrs.lineHeight).toBe(1.3)
      expect(attrs.indent).toBe(48)
      expect(attrs.firstLineIndent).toBe(32)
    })
  })
})
