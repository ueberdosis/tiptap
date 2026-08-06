// @vitest-environment happy-dom

import { Editor, Extension } from '@tiptap/core'
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

describe('Table node attribute updates (addGlobalAttributes)', () => {
  // An extension that adds a `class` attribute to the table node type via
  // addGlobalAttributes, mirroring how extensions like ClassLoom work.
  const TableClassAttr = Extension.create({
    name: 'tableClassAttr',
    addGlobalAttributes() {
      return [
        {
          types: ['table'],
          attributes: {
            class: {
              default: null,
              parseHTML: element => element.getAttribute('class') || null,
              renderHTML: attributes => (attributes.class ? { class: attributes.class } : {}),
            },
          },
        },
      ]
    },
  })

  let editor: Editor | null = null
  let editorEl: HTMLDivElement

  afterEach(() => {
    editor?.destroy()
    editor = null
    editorEl?.remove()
  })

  const createEditor = (tableOptions: Parameters<typeof Table.configure>[0] = {}) => {
    editorEl = document.createElement('div')
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
        Table.configure({ resizable: false, ...tableOptions }),
        TableClassAttr,
      ],
    })

    editor.commands.insertTable({ rows: 2, cols: 2, withHeaderRow: false })
    return editor
  }

  const findTablePos = (e: Editor): number => {
    let pos = -1

    e.state.doc.descendants((node, nodePos) => {
      if (node.type.name === 'table') {
        pos = nodePos
        return false
      }
    })
    return pos
  }

  it('reflects a class set via setNodeAttribute on the <table> DOM element', () => {
    createEditor()

    const tablePos = findTablePos(editor!)
    // editor.commands.command dispatches the transaction when the callback returns true.
    editor!.commands.command(({ tr }) => {
      tr.setNodeAttribute(tablePos, 'class', 'dynamic-class')
      return true
    })

    const table = editor!.view.dom.querySelector('table')!
    expect(table.classList.contains('dynamic-class')).toBe(true)
  })

  it('removes the class from the <table> DOM element when the attribute is cleared', () => {
    createEditor()

    const tablePos = findTablePos(editor!)

    editor!.commands.command(({ tr }) => {
      tr.setNodeAttribute(tablePos, 'class', 'to-be-removed')
      return true
    })

    expect(editor!.view.dom.querySelector('table')!.classList.contains('to-be-removed')).toBe(true)

    editor!.commands.command(({ tr }) => {
      tr.setNodeAttribute(findTablePos(editor!), 'class', null)
      return true
    })

    expect(editor!.view.dom.querySelector('table')!.getAttribute('class')).toBeNull()
  })

  it('merges a dynamic class with the static HTMLAttributes class', () => {
    createEditor({ HTMLAttributes: { class: 'base-class' } })

    const tablePos = findTablePos(editor!)
    editor!.commands.command(({ tr }) => {
      tr.setNodeAttribute(tablePos, 'class', 'added-class')
      return true
    })

    const table = editor!.view.dom.querySelector('table')!
    expect(table.classList.contains('base-class')).toBe(true)
    expect(table.classList.contains('added-class')).toBe(true)
  })
})
