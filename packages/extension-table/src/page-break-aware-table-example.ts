/**
 * Example: Using Page Break Aware Tables in TipTap
 *
 * This example demonstrates how to set up and use the page break aware table
 * system to handle table cells that exceed page height, similar to Google Docs.
 */

import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

import { PageBreakAwareTableKit } from './page-break-aware-table-kit.js'

/**
 * Create an editor with page break aware tables
 */
export function createEditorWithPageBreakTables(element: HTMLElement) {
  return new Editor({
    element,
    extensions: [
      StarterKit,
      PageBreakAwareTableKit.configure({
        table: {
          enablePageBreaks: true,
          resizable: true,
          handleWidth: 5,
          cellMinWidth: 25,
          lastColumnResizable: true,
          allowTableNodeSelection: false,
        },
        tableCell: {
          HTMLAttributes: {},
        },
        tableHeader: {
          HTMLAttributes: {},
        },
      }),
    ],
    content: `
      <h1>Page Break Aware Tables Demo</h1>
      <p>This document demonstrates how table cells can break across pages naturally.</p>
      
      <table data-page-break-enabled="true">
        <tr>
          <th>Column 1</th>
          <th>Column 2</th>
          <th>Column 3</th>
        </tr>
        <tr>
          <td>
            <p>This is a regular cell with normal content.</p>
          </td>
          <td>
            <p>This cell has a lot of content that might exceed the page height:</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
            <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.</p>
          </td>
          <td>
            <p>Another regular cell.</p>
          </td>
        </tr>
      </table>
    `,
  })
}

/**
 * Example: Programmatically setting page break behavior
 */
export function demonstratePageBreakCommands(editor: Editor) {
  // Insert a new page break aware table
  editor.commands.insertTable({
    rows: 3,
    cols: 3,
    withHeaderRow: true,
  })

  // Set cell attributes manually (since setCellPageBreak command needs to be added to interface)
  editor.commands.setCellAttribute('pageBreakBefore', 'avoid')
  editor.commands.setCellAttribute('pageBreakAfter', 'auto')
  editor.commands.setCellAttribute('pageBreakInside', 'auto')

  // You can also manually add page break classes to cells
  editor.commands.updateAttributes('pageBreakAwareTableCell', {
    class: 'page-break-before-avoid page-break-inside-auto',
  })
}

/**
 * Example: Handling table resize and content changes
 */
export function setupTableContentMonitoring(editor: Editor) {
  // The PageBreakAwareTableView automatically handles content monitoring
  // using ResizeObserver and MutationObserver, but you can also listen
  // to editor events for custom behavior

  editor.on('update', ({ editor: updatedEditor }) => {
    // Check if tables have been modified
    let tableCount = 0

    updatedEditor.state.doc.descendants(node => {
      if (node.type.name === 'pageBreakAwareTable') {
        tableCount += 1
        console.log(`Table ${tableCount} has ${node.childCount} rows`)
      }
    })
  })
}

/**
 * Example: CSS customization for specific use cases
 */
export function addCustomPageBreakStyles() {
  const customCSS = `
    /* Custom page break behavior for specific content types */
    .page-break-aware-cell .code-block {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    .page-break-aware-cell .important-content {
      page-break-before: always;
      break-before: always;
    }
    
    .page-break-aware-cell .keep-together {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    /* Improved print styles */
    @media print {
      .page-break-aware-table {
        page-break-before: avoid;
        break-before: avoid;
      }
      
      .page-break-aware-cell {
        /* Ensure cell borders are preserved across page breaks */
        box-decoration-break: clone;
        -webkit-box-decoration-break: clone;
      }
    }
  `

  const style = document.createElement('style')
  style.textContent = customCSS
  document.head.appendChild(style)
}

/**
 * Example: Integration with existing table extensions
 */
export function migrateFromStandardTable(editor: Editor) {
  // If you have existing tables using the standard table extension,
  // you can gradually migrate them to use page break awareness

  let tableCount = 0

  editor.state.doc.descendants(node => {
    if (node.type.name === 'table') {
      tableCount += 1

      // Convert standard table to page break aware table
      editor.commands.updateAttributes('table', {
        'data-page-break-enabled': 'true',
      })

      // Update all cells in the table
      // This would require traversing the table structure
      // and updating each cell individually
    }
  })

  console.log(`Found ${tableCount} tables to migrate`)
}

/**
 * Usage example:
 */
/*
// Basic setup
const editor = createEditorWithPageBreakTables(document.getElementById('editor'))

// Add custom styles
addCustomPageBreakStyles()

// Set up content monitoring
setupTableContentMonitoring(editor)

// Demonstrate commands
setTimeout(() => {
  demonstratePageBreakCommands(editor)
}, 1000)
*/
