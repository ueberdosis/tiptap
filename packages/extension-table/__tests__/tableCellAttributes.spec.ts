import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

describe('table cell attributes', () => {
  const editorElClass = 'tiptap-cell-attrs'
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
      extensions: [Document, Text, Paragraph, TableCell, TableHeader, TableRow, Table],
      content,
    })
    return editor
  }

  /** Helper to get the attrs of the first cell in the first row */
  const getFirstCellAttrs = () => {
    const json = editor!.getJSON()

    // @ts-expect-error content is not guaranteed to be this shape
    return json.content[0].content[0].content[0].attrs
  }

  /** Helper to get the first cell's rendered HTML element */
  const getFirstCellElement = () => {
    return getEditorEl()?.querySelector('td')
  }

  /** Helper to get the first header cell's rendered HTML element */
  const getFirstHeaderElement = () => {
    return getEditorEl()?.querySelector('th')
  }

  afterEach(() => {
    editor?.destroy()
    getEditorEl()?.remove()
    editor = null
  })

  describe('background', () => {
    it('should parse background-color from inline style', () => {
      createEditor('<table><tr><td style="background-color: #ECF0E9">Cell</td></tr></table>')

      expect(getFirstCellAttrs().background).toBe('#ECF0E9')
    })

    it('should render background-color as inline style', () => {
      createEditor('<table><tr><td style="background-color: #ECF0E9">Cell</td></tr></table>')

      expect(getFirstCellElement()?.style.backgroundColor).toBeTruthy()
    })

    it('should default to null when no background is set', () => {
      createEditor('<table><tr><td>Cell</td></tr></table>')

      expect(getFirstCellAttrs().background).toBeNull()
    })

    it('should round-trip via JSON', () => {
      createEditor('<table><tr><td style="background-color: rgb(255, 0, 0)">Cell</td></tr></table>')

      const json = editor!.getJSON()

      editor!.commands.setContent(json)

      expect(getFirstCellAttrs().background).toBeTruthy()
    })

    it('should work on table header cells', () => {
      createEditor('<table><tr><th style="background-color: #F0F0F0">Header</th></tr></table>')

      expect(getFirstHeaderElement()?.style.backgroundColor).toBeTruthy()
    })
  })

  describe('verticalAlign', () => {
    it('should parse vertical-align from inline style', () => {
      createEditor('<table><tr><td style="vertical-align: middle">Cell</td></tr></table>')

      expect(getFirstCellAttrs().verticalAlign).toBe('middle')
    })

    it('should accept top, middle, and bottom values', () => {
      ;['top', 'middle', 'bottom'].forEach(value => {
        createEditor(`<table><tr><td style="vertical-align: ${value}">Cell</td></tr></table>`)
        expect(getFirstCellAttrs().verticalAlign).toBe(value)
        editor?.destroy()
        getEditorEl()?.remove()
      })
    })

    it('should reject invalid vertical-align values', () => {
      createEditor('<table><tr><td style="vertical-align: baseline">Cell</td></tr></table>')

      expect(getFirstCellAttrs().verticalAlign).toBeNull()
    })

    it('should render vertical-align as inline style', () => {
      createEditor('<table><tr><td style="vertical-align: bottom">Cell</td></tr></table>')

      expect(getFirstCellElement()?.style.verticalAlign).toBe('bottom')
    })

    it('should default to null when no vertical-align is set', () => {
      createEditor('<table><tr><td>Cell</td></tr></table>')

      expect(getFirstCellAttrs().verticalAlign).toBeNull()
    })

    it('should work on table header cells', () => {
      createEditor('<table><tr><th style="vertical-align: middle">Header</th></tr></table>')

      expect(getFirstHeaderElement()?.style.verticalAlign).toBe('middle')
    })
  })

  describe('border attributes', () => {
    it('should parse all four border widths from inline styles', () => {
      createEditor(
        '<table><tr><td style="border-top-width: 2px; border-bottom-width: 1px; border-left-width: 3px; border-right-width: 1px">Cell</td></tr></table>',
      )

      const attrs = getFirstCellAttrs()

      expect(attrs.borderTopWidth).toBe(2)
      expect(attrs.borderBottomWidth).toBe(1)
      expect(attrs.borderLeftWidth).toBe(3)
      expect(attrs.borderRightWidth).toBe(1)
    })

    it('should parse all four border styles from inline styles', () => {
      createEditor(
        '<table><tr><td style="border-top-style: solid; border-bottom-style: dashed; border-left-style: dotted; border-right-style: double">Cell</td></tr></table>',
      )

      const attrs = getFirstCellAttrs()

      expect(attrs.borderTopStyle).toBe('solid')
      expect(attrs.borderBottomStyle).toBe('dashed')
      expect(attrs.borderLeftStyle).toBe('dotted')
      expect(attrs.borderRightStyle).toBe('double')
    })

    it('should parse all four border colors from inline styles', () => {
      createEditor(
        '<table><tr><td style="border-top-color: red; border-bottom-color: blue; border-left-color: green; border-right-color: black">Cell</td></tr></table>',
      )

      const attrs = getFirstCellAttrs()

      expect(attrs.borderTopColor).toBeTruthy()
      expect(attrs.borderBottomColor).toBeTruthy()
      expect(attrs.borderLeftColor).toBeTruthy()
      expect(attrs.borderRightColor).toBeTruthy()
    })

    it('should render border styles as inline styles on the element', () => {
      createEditor(
        '<table><tr><td style="border-top-width: 2px; border-top-style: solid; border-top-color: red">Cell</td></tr></table>',
      )

      const el = getFirstCellElement()

      expect(el?.style.borderTopWidth).toBe('2px')
      expect(el?.style.borderTopStyle).toBe('solid')
      expect(el?.style.borderTopColor).toBeTruthy()
    })

    it('should default all border attributes to null', () => {
      createEditor('<table><tr><td>Cell</td></tr></table>')

      const attrs = getFirstCellAttrs()

      expect(attrs.borderTopWidth).toBeNull()
      expect(attrs.borderTopStyle).toBeNull()
      expect(attrs.borderTopColor).toBeNull()
      expect(attrs.borderBottomWidth).toBeNull()
      expect(attrs.borderBottomStyle).toBeNull()
      expect(attrs.borderBottomColor).toBeNull()
      expect(attrs.borderLeftWidth).toBeNull()
      expect(attrs.borderLeftStyle).toBeNull()
      expect(attrs.borderLeftColor).toBeNull()
      expect(attrs.borderRightWidth).toBeNull()
      expect(attrs.borderRightStyle).toBeNull()
      expect(attrs.borderRightColor).toBeNull()
    })

    it('should round-trip border attributes via JSON', () => {
      createEditor('<table><tr><td style="border-top-width: 2px; border-top-style: solid">Cell</td></tr></table>')

      const json = editor!.getJSON()

      // @ts-expect-error content is not guaranteed to be this shape
      expect(json.content[0].content[0].content[0].attrs.borderTopWidth).toBe(2)
      // @ts-expect-error content is not guaranteed to be this shape
      expect(json.content[0].content[0].content[0].attrs.borderTopStyle).toBe('solid')

      editor!.commands.setContent(json)

      expect(getFirstCellAttrs().borderTopWidth).toBe(2)
      expect(getFirstCellAttrs().borderTopStyle).toBe('solid')
    })

    it('should work on table header cells', () => {
      createEditor(
        '<table><tr><th style="border-bottom-width: 3px; border-bottom-style: solid; border-bottom-color: black">Header</th></tr></table>',
      )

      const el = getFirstHeaderElement()

      expect(el?.style.borderBottomWidth).toBe('3px')
      expect(el?.style.borderBottomStyle).toBe('solid')
    })

    it('should handle partial borders (only some sides set)', () => {
      createEditor('<table><tr><td style="border-top-width: 1px; border-top-style: solid">Cell</td></tr></table>')

      const attrs = getFirstCellAttrs()

      expect(attrs.borderTopWidth).toBe(1)
      expect(attrs.borderTopStyle).toBe('solid')
      expect(attrs.borderBottomWidth).toBeNull()
      expect(attrs.borderLeftWidth).toBeNull()
      expect(attrs.borderRightWidth).toBeNull()
    })
  })

  describe('combined attributes', () => {
    it('should support all new attributes together', () => {
      createEditor(
        '<table><tr><td style="background-color: #ECF0E9; vertical-align: middle; border-top-width: 1px; border-top-style: solid; border-top-color: #000000">Cell</td></tr></table>',
      )

      const attrs = getFirstCellAttrs()

      expect(attrs.background).toBe('#ECF0E9')
      expect(attrs.verticalAlign).toBe('middle')
      expect(attrs.borderTopWidth).toBe(1)
      expect(attrs.borderTopStyle).toBe('solid')
    })

    it('should coexist with existing attributes (colspan, rowspan, align)', () => {
      createEditor(
        '<table><tr><td colspan="2" style="text-align: center; background-color: #F0F0F0; border-bottom-width: 2px; border-bottom-style: solid">Cell</td><td>Other</td></tr><tr><td>A</td><td>B</td><td>C</td></tr></table>',
      )

      const attrs = getFirstCellAttrs()

      expect(attrs.colspan).toBe(2)
      expect(attrs.align).toBe('center')
      expect(attrs.background).toBe('#F0F0F0')
      expect(attrs.borderBottomWidth).toBe(2)
      expect(attrs.borderBottomStyle).toBe('solid')
    })
  })
})
