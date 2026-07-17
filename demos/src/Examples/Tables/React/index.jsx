import './styles.scss'

import { TableCell, TableKit } from '@tiptap/extension-table'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
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
  const editorState = useEditorState({
    editor,
    selector: ctx => ({
      canAddColumnBefore: ctx.editor.can().addColumnBefore() ?? false,
      canAddColumnAfter: ctx.editor.can().addColumnAfter() ?? false,
      canDeleteColumn: ctx.editor.can().deleteColumn() ?? false,
      canAddRowBefore: ctx.editor.can().addRowBefore() ?? false,
      canAddRowAfter: ctx.editor.can().addRowAfter() ?? false,
      canDeleteRow: ctx.editor.can().deleteRow() ?? false,
      canDeleteTable: ctx.editor.can().deleteTable() ?? false,
      canMergeCells: ctx.editor.can().mergeCells() ?? false,
      canSplitCell: ctx.editor.can().splitCell() ?? false,
      canToggleHeaderColumn: ctx.editor.can().toggleHeaderColumn() ?? false,
      canToggleHeaderRow: ctx.editor.can().toggleHeaderRow() ?? false,
      canToggleHeaderCell: ctx.editor.can().toggleHeaderCell() ?? false,
      canMergeOrSplit: ctx.editor.can().mergeOrSplit() ?? false,
      canSetCellAttribute: ctx.editor.can().setCellAttribute('backgroundColor', '#FAF594') ?? false,
      canFixTables: ctx.editor.can().fixTables() ?? false,
      canGoToNextCell: ctx.editor.can().goToNextCell() ?? false,
      canGoToPreviousCell: ctx.editor.can().goToPreviousCell() ?? false,
    }),
  })

  if (!editor) {
    return null
  }

  return (
    <div className="control-group">
      <div className="button-group">
        <button
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          Insert table
        </button>
        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent(tableHTML, {
                parseOptions: {
                  preserveWhitespace: false,
                },
              })
              .run()
          }
        >
          Insert HTML table
        </button>
        <button
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          disabled={!editorState.canAddColumnBefore}
        >
          Add column before
        </button>
        <button
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          disabled={!editorState.canAddColumnAfter}
        >
          Add column after
        </button>
        <button
          onClick={() => editor.chain().focus().deleteColumn().run()}
          disabled={!editorState.canDeleteColumn}
        >
          Delete column
        </button>
        <button
          onClick={() => editor.chain().focus().addRowBefore().run()}
          disabled={!editorState.canAddRowBefore}
        >
          Add row before
        </button>
        <button
          onClick={() => editor.chain().focus().addRowAfter().run()}
          disabled={!editorState.canAddRowAfter}
        >
          Add row after
        </button>
        <button
          onClick={() => editor.chain().focus().deleteRow().run()}
          disabled={!editorState.canDeleteRow}
        >
          Delete row
        </button>
        <button
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={!editorState.canDeleteTable}
        >
          Delete table
        </button>
        <button
          onClick={() => editor.chain().focus().mergeCells().run()}
          disabled={!editorState.canMergeCells}
        >
          Merge cells
        </button>
        <button
          onClick={() => editor.chain().focus().splitCell().run()}
          disabled={!editorState.canSplitCell}
        >
          Split cell
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
          disabled={!editorState.canToggleHeaderColumn}
        >
          Toggle header column
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          disabled={!editorState.canToggleHeaderRow}
        >
          Toggle header row
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeaderCell().run()}
          disabled={!editorState.canToggleHeaderCell}
        >
          Toggle header cell
        </button>
        <button
          onClick={() => editor.chain().focus().mergeOrSplit().run()}
          disabled={!editorState.canMergeOrSplit}
        >
          Merge or split
        </button>
        <button
          onClick={() =>
            editor.chain().focus().setCellAttribute('backgroundColor', '#FAF594').run()
          }
          disabled={!editorState.canSetCellAttribute}
        >
          Set cell attribute
        </button>
        <button
          onClick={() => editor.chain().focus().fixTables().run()}
          disabled={!editorState.canFixTables}
        >
          Fix tables
        </button>
        <button
          onClick={() => editor.chain().focus().goToNextCell().run()}
          disabled={!editorState.canGoToNextCell}
        >
          Go to next cell
        </button>
        <button
          onClick={() => editor.chain().focus().goToPreviousCell().run()}
          disabled={!editorState.canGoToPreviousCell}
        >
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
      TableKit.configure({
        table: { resizable: true },
        tableCell: false,
      }),
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
