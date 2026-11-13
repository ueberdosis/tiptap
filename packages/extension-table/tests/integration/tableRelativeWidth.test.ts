import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'

const createEditor = (content: string, resizable = false) =>
  new Editor({
    element: document.createElement('div'),
    extensions: [
      Document,
      Paragraph,
      Text,
      Table.configure({ resizable }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
  })

const row = '<tr><td colwidth="100"><p>a</p></td><td colwidth="300"><p>b</p></td></tr>'

describe('relative table width', () => {
  let editor: Editor | undefined

  afterEach(() => {
    editor?.destroy()
    editor = undefined
  })

  it('keeps tables without a width as they are', () => {
    editor = createEditor(`<table><tbody>${row}</tbody></table>`)

    expect(editor.state.doc.firstChild?.attrs.width).toBeNull()
    expect(editor.getHTML()).toContain('<table style="width: 400px;">')
    expect(editor.getHTML()).toContain('<col style="width: 100px;"><col style="width: 300px;">')
  })

  it.each([
    ['a style', '<table style="width: 50%">', 50],
    ['the width attribute', '<table width="100%">', 100],
    ['a pixel width', '<table style="width: 600px">', null],
  ])('parses the width from %s', (_, tag, width) => {
    editor = createEditor(`${tag}<tbody>${row}</tbody></table>`)

    expect(editor.state.doc.firstChild?.attrs.width).toBe(width)
  })

  it('renders the stored column widths as proportions', () => {
    editor = createEditor(`<table style="width: 80%"><tbody>${row}</tbody></table>`)

    const html = editor.getHTML()

    expect(html).toContain('<table style="width: 80%; min-width: 50px;">')
    expect(html).toContain('<col style="width: 25%;"><col style="width: 75%;">')
  })

  it('round-trips the width through HTML', () => {
    editor = createEditor(`<table style="width: 80%"><tbody>${row}</tbody></table>`)

    const html = editor.getHTML()

    editor.commands.setContent(html)

    expect(editor.state.doc.firstChild?.attrs.width).toBe(80)
    expect(editor.getHTML()).toBe(html)
  })

  it.each([false, true])('renders the width in the editor with resizable: %s', resizable => {
    editor = createEditor(`<table style="width: 80%"><tbody>${row}</tbody></table>`, resizable)

    const table = editor.view.dom.querySelector('table') as HTMLTableElement
    const cols = Array.from(table.querySelectorAll('col')).map(col => col.style.width)

    expect(table.style.width).toBe('80%')
    expect(cols).toEqual(['25%', '75%'])
  })

  it('follows a change of the width in the editor', () => {
    editor = createEditor(`<table><tbody>${row}</tbody></table>`, true)

    editor.commands.command(({ tr }) => {
      tr.setNodeAttribute(0, 'width', 100)

      return true
    })

    const table = editor.view.dom.querySelector('table') as HTMLTableElement

    expect(table.style.width).toBe('100%')
    expect(table.querySelector('col')?.style.width).toBe('25%')
  })

  it('inserts a table with a width', () => {
    editor = createEditor('<p></p>')

    editor.commands.insertTable({ rows: 2, cols: 4, width: 100 })

    const table = editor.state.doc.firstChild

    expect(table?.type.name).toBe('table')
    expect(table?.attrs.width).toBe(100)
    expect(editor.getHTML()).toContain('<col style="width: 25%;">')
  })

  it('inserts a table without a width by default', () => {
    editor = createEditor('<p></p>')

    editor.commands.insertTable({ rows: 2, cols: 2 })

    expect(editor.state.doc.firstChild?.attrs.width).toBeNull()
  })
})
