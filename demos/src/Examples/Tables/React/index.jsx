import './styles.scss'

import { Table as TableExtension, TableCell as DefaultTableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Plugin } from 'prosemirror-state'
import { CellSelection } from 'prosemirror-tables'
import React from 'react'

/**
 * CustomTableCell
 *
 * 1) Extends the default TableCell so we can add a `backgroundColor` attribute.
 * 2) Installs a tiny ProseMirror plugin that intercepts right-clicks (button === 2)
 *    inside any cell that is already part of a multi-cell selection, and prevents
 *    ProseMirror from collapsing that selection down to one cell.
 */
const CustomTableCell = DefaultTableCell.extend({
  addAttributes() {
    return {
      // Preserve any attributes that DefaultTableCell already had
      ...this.parent?.(),

      // Add our custom backgroundColor attribute
      backgroundColor: {
        default: null,
        parseHTML: element => element.getAttribute('data-background-color'),
        renderHTML: attributes => ({
          'data-background-color': attributes.backgroundColor,
          style: `background-color: ${attributes.backgroundColor}`,
        }),
      },
    }
  },

  addProseMirrorPlugins() {
    // Grab any plugins the base TableCell already registers
    const parentPlugins = this.parent?.() || []

    // This plugin’s sole job is to watch for event.button === 2 (right-click)
    // inside a CellSelection range, and call preventDefault() if we’re already
    // multi-selecting cells so ProseMirror does NOT collapse the selection.
    const preventRightClickClearing = new Plugin({
      props: {
        handleDOMEvents: {
          mousedown: (view, event) => {
            // Only intercept “right-click”
            if (event.button !== 2) {
              return false
            }

            // Find the document position under the mouse
            const { clientX, clientY } = event
            const result = view.posAtCoords({ left: clientX, top: clientY })
            if (!result) {
              return false
            }

            const { pos } = result
            const { selection } = view.state

            // If we already have a CellSelection, check if pos is within it
            if (selection instanceof CellSelection) {
              const isInSelectedRange = selection.ranges.some(({ $from, $to }) => pos >= $from.pos && pos <= $to.pos)

              if (isInSelectedRange) {
                // Prevent ProseMirror’s default “collapse to one cell” behavior
                event.preventDefault()
                return true
              }
            }

            return false
          },
        },
      },
    })

    return [...parentPlugins, preventRightClickClearing]
  },
})

/** Some example HTML we can insert via “Insert HTML table” */
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

/** MenuBar component with all your table‐related buttons */
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
        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent(tableHTML, { parseOptions: { preserveWhitespace: false } })
              .run()
          }
        >
          Insert HTML table
        </button>
        <button
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          disabled={!editor.can().addColumnBefore()}
        >
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
        <button
          onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
          disabled={!editor.can().toggleHeaderColumn()}
        >
          Toggle header column
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          disabled={!editor.can().toggleHeaderRow()}
        >
          Toggle header row
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeaderCell().run()}
          disabled={!editor.can().toggleHeaderCell()}
        >
          Toggle header cell
        </button>
        <button onClick={() => editor.chain().focus().mergeOrSplit().run()} disabled={!editor.can().mergeOrSplit()}>
          Merge or split
        </button>
        <button
          onClick={() => editor.chain().focus().setCellAttribute('backgroundColor', '#FAF594').run()}
          disabled={!editor.can().setCellAttribute('backgroundColor', '#FAF594')}
        >
          Set cell attribute
        </button>
        <button onClick={() => editor.chain().focus().fixTables().run()} disabled={!editor.can().fixTables()}>
          Fix tables
        </button>
        <button onClick={() => editor.chain().focus().goToNextCell().run()} disabled={!editor.can().goToNextCell()}>
          Go to next cell
        </button>
        <button
          onClick={() => editor.chain().focus().goToPreviousCell().run()}
          disabled={!editor.can().goToPreviousCell()}
        >
          Go to previous cell
        </button>
      </div>
    </div>
  )
}

/** Main Editor component */
export default function EditorWithTables() {
  const editor = useEditor({
    extensions: [
      StarterKit,

      // 1) Register the Table node itself, with resize enabled
      TableExtension.configure({ resizable: true }),

      // 2) Register the TableRow node
      TableRow,

      // 3) Register the TableHeader node (this also pulls in TableBody under the hood)
      TableHeader,

      // 4) Replace TableCell with our custom version (backgroundColor + right-click plugin)
      CustomTableCell,
    ],
    content: `
      <h3>Have you seen our tables? They are amazing!</h3>
      <ul>
        <li>Tables with rows, cells and headers (optional)</li>
        <li>Support for <code>colgroup</code> and <code>rowspan</code></li>
        <li>And even resizable columns (optional)</li>
      </ul>
      <p>Here is an example:</p>
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
    shouldRerenderOnTransaction: true,
  })

  return (
    <>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </>
  )
}
