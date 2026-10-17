import { generateHTML, type JSONContent } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import { describe, expect, test } from 'vite-plus/test'

const extensions = [Document, Paragraph, Text, Table, TableRow, TableCell, TableHeader]

const renderCell = (type: 'tableCell' | 'tableHeader', align: string) => {
  const content: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type,
                attrs: { align },
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Example' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }

  return generateHTML(content, extensions)
}

describe('table cell alignment rendering', () => {
  test.each(['tableCell', 'tableHeader'] satisfies Array<'tableCell' | 'tableHeader'>)(
    'renders an allowed alignment on %s JSON',
    type => {
      expect(renderCell(type, 'center')).toContain('style="text-align: center;"')
    },
  )

  test.each(['tableCell', 'tableHeader'] satisfies Array<'tableCell' | 'tableHeader'>)(
    'does not render extra declarations from %s JSON',
    type => {
      const html = renderCell(type, 'left; position: fixed')

      expect(html).not.toContain('text-align')
      expect(html).not.toContain('position')
    },
  )
})
