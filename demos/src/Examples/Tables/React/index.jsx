import './styles.scss'

import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      // extend the existing attributes …
      ...this.parent?.(),

      // and add a new one …
      backgroundColor: {
        default: null,
        parseHTML: element => element.getAttribute('data-background-color'),
        renderHTML: attributes => {
          return {
            'data-background-color': attributes.backgroundColor,
            style: `background-color: ${attributes.backgroundColor}`,
          }
        },
      },
    }
  },
})

export const tableHTML = `
  <table style="width:100%">
    <tr>
      <th>Firstname</th>
      <th>Lastname</th>
      <th>Age</th>
    </tr>
    <tr>
      <td>Jill</td>
      <td>Smith</td>
      <td>50</td>
    </tr>
    <tr>
      <td>Eve</td>
      <td>Jackson</td>
      <td>94</td>
    </tr>
    <tr>
      <td>John</td>
      <td>Doe</td>
      <td>80</td>
    </tr>
  </table>
`

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="control-group">
        <div className="button-group">
        <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
          Insert table
        </button>
        <button onClick={() => editor.chain().focus().insertContent(tableHTML, {
          parseOptions: {
            preserveWhitespace: false,
          },
        }).run()}>
          Insert HTML table
        </button>
        <button onClick={() => editor.chain().focus().addColumnBefore().run()} disabled={!editor.can().addColumnBefore()}>
          Add column before
        </button>
        <button onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.can().addColumnAfter()}>
          Add column after
        </button>
        <button onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.can().deleteColumn()}>
          Delete column
        </button>
        <button onClick={() => editor.chain().focus().addRowBefore().run()} disabled={!editor.can().addRowBefore()}>
          Add row before
        </button>
        <button onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.can().addRowAfter()}>
          Add row after
        </button>
        <button onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.can().deleteRow()}>
          Delete row
        </button>
        <button onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.can().deleteTable()}>
          Delete table
        </button>
        <button onClick={() => editor.chain().focus().mergeCells().run()} disabled={!editor.can().mergeCells()}>
          Merge cells
        </button>
        <button onClick={() => editor.chain().focus().splitCell().run()} disabled={!editor.can().splitCell()}>
          Split cell
        </button>
        <button onClick={() => editor.chain().focus().toggleHeaderColumn().run()} disabled={!editor.can().toggleHeaderColumn()}>
          ToggleHeaderColumn
        </button>
        <button onClick={() => editor.chain().focus().toggleHeaderRow().run()} disabled={!editor.can().toggleHeaderRow()}>
          Toggle header row
        </button>
        <button onClick={() => editor.chain().focus().toggleHeaderCell().run()} disabled={!editor.can().toggleHeaderCell()}>
          Toggle header cell
        </button>
        <button onClick={() => editor.chain().focus().mergeOrSplit().run()} disabled={!editor.can().mergeOrSplit()}>
          Merge or split
        </button>
        <button onClick={() => editor.chain().focus().setCellAttribute('backgroundColor', '#FAF594').run()} disabled={!editor.can().setCellAttribute('backgroundColor', '#FAF594')}>
          Set cell attribute
        </button>
        <button onClick={() => editor.chain().focus().fixTables().run()} disabled={!editor.can().fixTables()}>
          Fix tables
        </button>
        <button onClick={() => editor.chain().focus().goToNextCell().run()} disabled={!editor.can().goToNextCell()}>
          Go to next cell
        </button>
        <button onClick={() => editor.chain().focus().goToPreviousCell().run()} disabled={!editor.can().goToPreviousCell()}>
          Go to previous cell
        </button>
      </div>
    </div>
  )
}

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      // Default TableCell
      // TableCell,
      // Custom TableCell with backgroundColor attribute
      CustomTableCell,
    ],
    content: `
      <h3>
        Have you seen our tables? They are amazing!
      </h3>
      <ul>
        <li>Tables with rows, cells and headers (optional)</li>
        <li>Support for <code>colgroup</code> and <code>rowspan</code></li>
        <li>And even resizable columns (optional)</li>
      </ul>
      <p>
        Here is an example:
      </p>
      <table>
        <tbody>
          <tr>
            <th colwidth="200">Name</th>
            <th colspan="3" colwidth="150,100">Description</th>
          </tr>
          <tr>
            <td>Cyndi Lauper</td>
            <td>Singer</td>
            <td>Songwriter</td>
            <td>Actress</td>
          </tr>
          <tr>
            <td>Marie Curie</td>
            <td>Scientist</td>
            <td>Chemist</td>
            <td>Physicist</td>
          </tr>
          <tr>
            <td>Indira Gandhi</td>
            <td>Prime minister</td>
            <td colspan="2">Politician</td>
          </tr>
        </tbody>
      </table>
    `,
  })

  return (
    <>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </>
  )
}
