/// <reference types="cypress" />

import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import Text from '@tiptap/extension-text'

describe('extension table cell', () => {
  const editorElClass = 'tiptap'
  let editor: Editor | null = null

  const createEditorEl = () => {
    const editorEl = document.createElement('div')

    editorEl.classList.add(editorElClass)
    document.body.appendChild(editorEl)
    return editorEl
  }
  const getEditorEl = () => document.querySelector(`.${editorElClass}`)

  it('should start with a Table', () => {
    const content = '<table style="width:100%"><tr><td>Firstname</td><td>Lastname</td><td>Age</td></tr><tr><td>Jill</td><td>Smith</td><td>50</td></tr><tr><td>Eve</td><td>Jackson</td><td>94</td></tr><tr><td>John</td><td>Doe</td><td>80</td></tr></table>'

    editor = new Editor({
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
      content,
    })

    expect(editor.getHTML()).to.include('Jackson')

    editor?.destroy()
    getEditorEl()?.remove()
  })

  it('should parse a single colWidth', () => {
    const content = '<table><tbody><tr><td colwidth="200">Name</td><td>Description</td></tr><tr><td>Cyndi Lauper</td><td>Singer</td><td>Songwriter</td><td>Actress</td></tr><tr><td>Marie Curie</td><td>Scientist</td><td>Chemist</td><td>Physicist</td></tr><tr><td>Indira Gandhi</td><td>Prime minister</td><td colspan="2">Politician</td></tr></tbody></table>'

    editor = new Editor({
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
      content,
    })

    expect(editor.getJSON().content[0].content[0].content[0].attrs.colwidth[0]).to.eq(200)

    editor?.destroy()
    getEditorEl()?.remove()
  })

  it('should parse multiple colWidths', () => {
    const content = '<table><tbody><tr><td colwidth="200">Name</td><td colspan="3" colwidth="150,100">Description</td></tr><tr><td>Cyndi Lauper</td><td>Singer</td><td>Songwriter</td><td>Actress</td></tr><tr><td>Marie Curie</td><td>Scientist</td><td>Chemist</td><td>Physicist</td></tr><tr><td>Indira Gandhi</td><td>Prime minister</td><td colspan="2">Politician</td></tr></tbody></table>'

    editor = new Editor({
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
      content,
    })

    expect(editor.getJSON().content[0].content[0].content[1].attrs.colwidth).deep.equal([150, 100])

    editor?.destroy()
    getEditorEl()?.remove()
  })
})
