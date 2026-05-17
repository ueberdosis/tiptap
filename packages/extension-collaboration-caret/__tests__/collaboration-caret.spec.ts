import { Editor } from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'
import * as Y from 'yjs'

/**
 * Tests for CollaborationCaret extension, especially edge cases
 * with initial HTML content and complex structures like tables.
 */
describe('extension-collaboration-caret', () => {
  const editorElClass = 'tiptap'

  const createEditorEl = () => {
    const editorEl = document.createElement('div')

    editorEl.classList.add(editorElClass)
    document.body.appendChild(editorEl)
    return editorEl
  }

  const getEditorEl = () => document.querySelector(`.${editorElClass}`)

  /**
   * Test that the editor can be initialized with HTML content containing tables
   * when using Collaboration and CollaborationCaret extensions.
   *
   * This test reproduces the issue from GitHub #6979 where the editor crashes
   * with "Cannot read properties of undefined (reading 'doc')" when initialized
   * with HTML content containing tables.
   */
  it('should not crash when initialized with HTML content containing tables', () => {
    const ydoc = new Y.Doc()

    // Create a mock provider with minimal awareness API
    const mockProvider = {
      awareness: {
        states: new Map(),
        setLocalStateField: () => {},
        on: () => {},
        off: () => {},
        getStates: () => new Map(),
      },
    }

    const editorEl = createEditorEl()

    // This should not throw an error
    expect(() => {
      const editor = new Editor({
        element: editorEl,
        extensions: [
          Document,
          Paragraph,
          Text,
          Table,
          TableRow,
          TableHeader,
          TableCell,
          Collaboration.configure({
            document: ydoc,
          }),
          CollaborationCaret.configure({
            provider: mockProvider,
            user: {
              name: 'Test User',
              color: '#ff0000',
            },
          }),
        ],
        content: `
          <table>
            <tr>
              <th>Header 1</th>
              <th>Header 2</th>
            </tr>
            <tr>
              <td>Cell 1</td>
              <td>Cell 2</td>
            </tr>
          </table>
        `,
      })

      editor.destroy()
    }).not.toThrow()

    getEditorEl()?.remove()
  })

  /**
   * Test that the editor can be initialized with simple HTML content
   * when using Collaboration and CollaborationCaret extensions.
   */
  it('should not crash when initialized with simple HTML content', () => {
    const ydoc = new Y.Doc()

    const mockProvider = {
      awareness: {
        states: new Map(),
        setLocalStateField: () => {},
        on: () => {},
        off: () => {},
        getStates: () => new Map(),
      },
    }

    const editorEl = createEditorEl()

    expect(() => {
      const editor = new Editor({
        element: editorEl,
        extensions: [
          Document,
          Paragraph,
          Text,
          Collaboration.configure({
            document: ydoc,
          }),
          CollaborationCaret.configure({
            provider: mockProvider,
            user: {
              name: 'Test User',
              color: '#ff0000',
            },
          }),
        ],
        content: '<p>Hello world</p>',
      })

      editor.destroy()
    }).not.toThrow()

    getEditorEl()?.remove()
  })

  /**
   * Test that the editor can be initialized without any content
   * when using Collaboration and CollaborationCaret extensions.
   */
  it('should work correctly when initialized without content', () => {
    const ydoc = new Y.Doc()

    const mockProvider = {
      awareness: {
        states: new Map(),
        setLocalStateField: () => {},
        on: () => {},
        off: () => {},
        getStates: () => new Map(),
      },
    }

    const editorEl = createEditorEl()

    expect(() => {
      const editor = new Editor({
        element: editorEl,
        extensions: [
          Document,
          Paragraph,
          Text,
          Collaboration.configure({
            document: ydoc,
          }),
          CollaborationCaret.configure({
            provider: mockProvider,
            user: {
              name: 'Test User',
              color: '#ff0000',
            },
          }),
        ],
      })

      editor.destroy()
    }).not.toThrow()

    getEditorEl()?.remove()
  })
})
