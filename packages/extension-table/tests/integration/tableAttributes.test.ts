import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'

describe('extended table attributes', () => {
  let editor: Editor | undefined

  afterEach(() => {
    editor?.destroy()
  })

  it.each([false, true])('renders and updates attributes with resizable: %s', resizable => {
    const CustomTable = Table.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          noBorder: {
            default: false,
            renderHTML: attributes =>
              attributes.noBorder ? { 'data-no-border': 'true', style: 'border: none' } : {},
          },
          internal: { default: 'hidden', rendered: false },
        }
      },
    })

    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        CustomTable.configure({ resizable, HTMLAttributes: { class: 'custom-table' } }),
        TableRow,
        TableCell,
        TableHeader,
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'table',
            attrs: { noBorder: true },
            content: [
              {
                type: 'tableRow',
                content: [{ type: 'tableCell', content: [{ type: 'paragraph' }] }],
              },
            ],
          },
        ],
      },
    })

    const getTable = () => editor!.view.dom.querySelector('table')!

    expect(getTable().className).toBe('custom-table')
    expect(getTable().getAttribute('data-no-border')).toBe('true')
    expect(getTable().style.border).toContain('none')
    expect(getTable().hasAttribute('internal')).toBe(false)

    editor.commands.setTextSelection(4)
    expect(editor.commands.updateAttributes('table', { noBorder: false })).toBe(true)
    expect(editor.state.doc.firstChild?.attrs.noBorder).toBe(false)
    expect(getTable().hasAttribute('data-no-border')).toBe(false)
    expect(getTable().style.border).toBe('')

    expect(editor.commands.updateAttributes('table', { noBorder: true })).toBe(true)
    expect(getTable().getAttribute('data-no-border')).toBe('true')
    expect(getTable().style.border).toContain('none')
    expect(getTable().className).toBe('custom-table')

    const table = getTable()

    expect(editor.commands.setCellAttribute('colwidth', [120])).toBe(true)
    expect(getTable()).toBe(table)
    expect(getTable().querySelector('col')?.style.width).toBe('120px')
    expect(getTable().getAttribute('data-no-border')).toBe('true')
  })
})
