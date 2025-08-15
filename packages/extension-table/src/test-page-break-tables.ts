/**
 * Test script to verify page break aware table functionality
 */

import { Editor } from '@tiptap/core'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'

import { PageBreakAwareTableKit } from './page-break-aware-table-kit.js'

/**
 * Create a test editor instance
 */
function createTestEditor(): Editor {
  return new Editor({
    extensions: [
      Document,
      Paragraph,
      Text,
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
      <h1>Page Break Aware Tables Test</h1>
      <p>Testing table functionality with page breaks.</p>
    `,
  })
}

/**
 * Test basic table operations
 */
function testBasicTableOperations(editor: Editor): boolean {
  console.log('Testing basic table operations...')

  try {
    // Insert a table
    const insertResult = editor.commands.insertTable({
      rows: 3,
      cols: 3,
      withHeaderRow: true,
    })

    if (!insertResult) {
      console.error('Failed to insert table')
      return false
    }

    // Check if table was inserted
    let tableFound = false
    editor.state.doc.descendants(node => {
      if (node.type.name === 'pageBreakAwareTable') {
        tableFound = true
        console.log(`✓ Table inserted successfully with ${node.childCount} rows`)
      }
    })

    if (!tableFound) {
      console.error('Table not found in document')
      return false
    }

    console.log('✓ Basic table operations test passed')
    return true
  } catch (error) {
    console.error('Basic table operations test failed:', error)
    return false
  }
}

/**
 * Test page break attributes
 */
function testPageBreakAttributes(editor: Editor): boolean {
  console.log('Testing page break attributes...')

  try {
    // Set cell attributes
    editor.commands.setCellAttribute('pageBreakBefore', 'avoid')
    editor.commands.setCellAttribute('pageBreakAfter', 'auto')
    editor.commands.setCellAttribute('pageBreakInside', 'auto')

    console.log('✓ Page break attributes test passed')
    return true
  } catch (error) {
    console.error('Page break attributes test failed:', error)
    return false
  }
}

/**
 * Test HTML output with page break classes
 */
function testHtmlOutput(editor: Editor): boolean {
  console.log('Testing HTML output...')

  try {
    const html = editor.getHTML()

    // Check for page break aware table classes
    if (!html.includes('page-break-aware-table')) {
      console.error('Page break aware table class not found in HTML')
      return false
    }

    if (!html.includes('page-break-aware-cell')) {
      console.error('Page break aware cell class not found in HTML')
      return false
    }

    if (!html.includes('data-page-break-enabled')) {
      console.error('Page break enabled attribute not found in HTML')
      return false
    }

    console.log('✓ HTML output test passed')
    console.log('Generated HTML:', html)
    return true
  } catch (error) {
    console.error('HTML output test failed:', error)
    return false
  }
}

/**
 * Test CSS injection
 */
function testCssInjection(): boolean {
  console.log('Testing CSS injection...')

  try {
    // Check if CSS was injected
    if (typeof document !== 'undefined') {
      const styleElement = document.getElementById('tiptap-page-break-table-styles')

      if (!styleElement) {
        console.error('Page break table styles not found')
        return false
      }

      const cssContent = styleElement.textContent || ''

      if (!cssContent.includes('.page-break-aware-cell')) {
        console.error('Page break cell styles not found in CSS')
        return false
      }

      if (!cssContent.includes('@media print')) {
        console.error('Print media queries not found in CSS')
        return false
      }

      console.log('✓ CSS injection test passed')
      return true
    } 
      console.log('⚠ CSS injection test skipped (no document available)')
      return true
    
  } catch (error) {
    console.error('CSS injection test failed:', error)
    return false
  }
}

/**
 * Run all tests
 */
export function runPageBreakTableTests(): boolean {
  console.log('=== Page Break Aware Tables Test Suite ===')

  const editor = createTestEditor()

  const testFunctions = [
    () => testBasicTableOperations(editor),
    () => testPageBreakAttributes(editor),
    () => testHtmlOutput(editor),
    () => testCssInjection(),
  ]

  let allTestsPassed = true

  testFunctions.forEach(testFunction => {
    const result = testFunction()
    if (!result) {
      allTestsPassed = false
    }
  })

  // Clean up
  editor.destroy()

  if (allTestsPassed) {
    console.log('✅ All tests passed!')
  } else {
    console.log('❌ Some tests failed')
  }

  return allTestsPassed
}

/**
 * For Node.js testing or direct execution
 */
if (typeof window === 'undefined') {
  // Mock document for Node.js environment
  global.document = {
    getElementById: () => null,
    createElement: () => ({ id: '', textContent: '', remove: () => {} }),
    head: { appendChild: () => {} },
  } as any

  runPageBreakTableTests()
}
