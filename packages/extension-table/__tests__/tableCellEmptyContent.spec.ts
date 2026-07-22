import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

/** Regression tests for empty `<td>`/`<th>` insertion — https://github.com/ueberdosis/tiptap/issues/6237 */
describe('extension table empty cell/header parsing', () => {
  const editorElClass = 'tiptap'
  let editor: Editor | null = null

  const createEditorEl = () => {
    const editorEl = document.createElement('div')

    editorEl.classList.add(editorElClass)
    document.body.appendChild(editorEl)
    return editorEl
  }
  const getEditorEl = () => document.querySelector(`.${editorElClass}`)

  const createTableEditor = () =>
    new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Text,
        Paragraph,
        TableCell,
        TableHeader,
        TableRow,
        Table.configure({
          resizable: true,
        }),
      ],
      content: '<p></p>',
    })

  afterEach(() => {
    editor?.destroy()
    editor = null
    getEditorEl()?.remove()
  })

  it('inserts a table with an empty cell without throwing, backfilling an empty paragraph', () => {
    editor = createTableEditor()

    expect(() => {
      editor?.commands.insertContentAt(0, '<table><tr><td></td></tr></table>')
    }).not.toThrow()

    const cellNode = editor.getJSON().content?.[0]?.content?.[0]?.content?.[0]

    expect(cellNode?.type).toBe('tableCell')
    expect(cellNode?.content).toEqual([{ type: 'paragraph' }])
  })

  it('inserts a table with an empty header cell without throwing, backfilling an empty paragraph', () => {
    editor = createTableEditor()

    expect(() => {
      editor?.commands.insertContentAt(0, '<table><tr><th></th></tr></table>')
    }).not.toThrow()

    const headerNode = editor.getJSON().content?.[0]?.content?.[0]?.content?.[0]

    expect(headerNode?.type).toBe('tableHeader')
    expect(headerNode?.content).toEqual([{ type: 'paragraph' }])
  })

  it('inserts an empty cell via insertContent without throwing', () => {
    editor = createTableEditor()

    expect(() => {
      editor?.commands.insertContent('<table><tr><td></td></tr></table>')
    }).not.toThrow()

    const cellNode = editor.getJSON().content?.[0]?.content?.[0]?.content?.[0]

    expect(cellNode?.type).toBe('tableCell')
    expect(cellNode?.content).toEqual([{ type: 'paragraph' }])
  })

  it('inserts an empty header cell via insertContent without throwing', () => {
    editor = createTableEditor()

    expect(() => {
      editor?.commands.insertContent('<table><tr><th></th></tr></table>')
    }).not.toThrow()

    const headerNode = editor.getJSON().content?.[0]?.content?.[0]?.content?.[0]

    expect(headerNode?.type).toBe('tableHeader')
    expect(headerNode?.content).toEqual([{ type: 'paragraph' }])
  })

  it('backfills a whitespace-only cell when preserveWhitespace is false', () => {
    editor = createTableEditor()

    expect(() => {
      editor?.commands.insertContentAt(0, '<table><tr><td>   </td></tr></table>', {
        parseOptions: { preserveWhitespace: false },
      })
    }).not.toThrow()

    const cellNode = editor.getJSON().content?.[0]?.content?.[0]?.content?.[0]

    expect(cellNode?.content).toEqual([{ type: 'paragraph' }])
  })

  it.each([
    ['default (no parseOptions)', undefined],
    ['preserveWhitespace: true', { preserveWhitespace: true as const }],
    ['preserveWhitespace: "full"', { preserveWhitespace: 'full' as const }],
  ])('backfills a whitespace-only cell identically to setContent — %s', (_label, parseOptions) => {
    const tableHTML = '<table><tr><td>   </td></tr></table>'

    // setContent collapses a spaces-only cell too, so no whitespace is lost.
    const setContentEditor = createTableEditor()
    setContentEditor.commands.setContent(tableHTML)
    const reference = setContentEditor.getJSON().content?.[0]?.content?.[0]?.content?.[0]?.content
    setContentEditor.destroy()

    editor = createTableEditor()
    expect(() => {
      editor?.commands.insertContentAt(0, tableHTML, parseOptions ? { parseOptions } : undefined)
    }).not.toThrow()

    const cellContent = editor.getJSON().content?.[0]?.content?.[0]?.content?.[0]?.content

    expect(cellContent).toEqual(reference)
    expect(cellContent).toEqual([{ type: 'paragraph' }])
  })

  it('produces the same empty cell as setContent does', () => {
    const tableHTML = '<table><tr><td></td></tr></table>'

    const setContentEditor = createTableEditor()
    setContentEditor.commands.setContent(tableHTML)
    const setContentCell =
      setContentEditor.getJSON().content?.[0]?.content?.[0]?.content?.[0]?.content
    setContentEditor.destroy()

    editor = createTableEditor()
    editor.commands.insertContentAt(0, tableHTML)
    const insertContentCell = editor.getJSON().content?.[0]?.content?.[0]?.content?.[0]?.content

    expect(insertContentCell).toEqual(setContentCell)
    expect(insertContentCell).toEqual([{ type: 'paragraph' }])
  })

  it('preserves a non-breaking-space cell instead of treating it as empty', () => {
    editor = createTableEditor()

    // trim() would strip the NBSP; it must survive as text, not be backfilled.
    editor.commands.insertContentAt(0, '<table><tr><td>&nbsp;</td></tr></table>')

    const cellNode = editor.getJSON().content?.[0]?.content?.[0]?.content?.[0]

    expect(cellNode?.type).toBe('tableCell')
    expect(cellNode?.content).toEqual([
      { type: 'paragraph', content: [{ type: 'text', text: ' ' }] },
    ])
  })

  it('backfills using the schema block when no paragraph node exists', () => {
    const el = createEditorEl()
    // A valid schema whose only block is Heading (no Paragraph).
    const headingOnlyEditor = new Editor({
      element: el,
      extensions: [Document, Text, Heading, TableCell, TableHeader, TableRow, Table],
      content: '<h1>x</h1>',
    })

    expect(() => {
      headingOnlyEditor.commands.insertContentAt(0, '<table><tr><td></td></tr></table>')
    }).not.toThrow()

    const cellNode = headingOnlyEditor.getJSON().content?.[0]?.content?.[0]?.content?.[0]

    // Fill uses the schema's block (heading here), not a hard-coded paragraph.
    expect(cellNode?.content?.[0]?.type).toBe('heading')

    headingOnlyEditor.destroy()
    el.remove()
  })

  it('keeps non-empty cell content intact (regression)', () => {
    editor = createTableEditor()

    editor.commands.insertContentAt(0, '<table><tr><td>hello</td></tr></table>')

    const cellNode = editor.getJSON().content?.[0]?.content?.[0]?.content?.[0]

    expect(cellNode?.content).toEqual([
      { type: 'paragraph', content: [{ type: 'text', text: 'hello' }] },
    ])
  })

  it('keeps non-empty header content intact (regression)', () => {
    editor = createTableEditor()

    editor.commands.insertContentAt(0, '<table><tr><th>hello</th></tr></table>')

    const headerNode = editor.getJSON().content?.[0]?.content?.[0]?.content?.[0]

    expect(headerNode?.content).toEqual([
      { type: 'paragraph', content: [{ type: 'text', text: 'hello' }] },
    ])
  })

  it('still parses colspan/colwidth on a multi-cell table (regression)', () => {
    editor = createTableEditor()

    editor.commands.insertContentAt(
      0,
      '<table><tr><td colwidth="200">Name</td><td colspan="2">Description</td></tr></table>',
    )

    const row = editor.getJSON().content?.[0]?.content?.[0]

    expect(row?.content?.[0]?.attrs?.colwidth).toEqual([200])
    expect(row?.content?.[1]?.attrs?.colspan).toBe(2)
  })
})
