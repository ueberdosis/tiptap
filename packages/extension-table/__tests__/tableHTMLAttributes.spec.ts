// @vitest-environment happy-dom

import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

describe('Table HTMLAttributes', () => {
  let editor: Editor | null = null

  afterEach(() => {
    editor?.destroy()
    editor = null
  })

  it('applies HTMLAttributes to the <table> element when resizable is false (default)', () => {
    const editorEl = document.createElement('div')
    document.body.appendChild(editorEl)

    editor = new Editor({
      element: editorEl,
      extensions: [
        Document,
        Text,
        Paragraph,
        TableCell,
        TableHeader,
        TableRow,
        Table.configure({
          HTMLAttributes: { class: 'my-custom-table', 'data-test': 'table-test' },
          resizable: false,
        }),
      ],
    })
    editor.commands.insertTable({ rows: 2, cols: 2, withHeaderRow: false })

    const table = editor.view.dom.querySelector('table')!
    expect(table.classList.contains('my-custom-table')).toBe(true)
    expect(table.getAttribute('data-test')).toBe('table-test')

    editorEl.remove()
  })

  it('applies HTMLAttributes to the <table> element when View is null (renderHTML fallback)', () => {
    const editorEl = document.createElement('div')
    document.body.appendChild(editorEl)

    editor = new Editor({
      element: editorEl,
      extensions: [
        Document,
        Text,
        Paragraph,
        TableCell,
        TableHeader,
        TableRow,
        Table.configure({
          HTMLAttributes: { class: 'fallback-class' },
          View: null,
        }),
      ],
    })
    editor.commands.insertTable({ rows: 2, cols: 2, withHeaderRow: false })

    const table = editor.view.dom.querySelector('table')!
    expect(table.classList.contains('fallback-class')).toBe(true)

    editorEl.remove()
  })
})
