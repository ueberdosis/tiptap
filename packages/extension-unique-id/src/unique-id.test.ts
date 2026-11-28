import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import { TableKit } from '@tiptap/extension-table'
import Text from '@tiptap/extension-text'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'

import { UniqueID } from './unique-id.js'

/**
 * Dispatch a real paste event so the plugin arms transformPasted,
 * then run the editor's paste logic with the given HTML.
 */
function pasteHTML(editor: Editor, html: string) {
  editor.view.dom.dispatchEvent(new Event('paste', { bubbles: true }))
  editor.view.pasteHTML(html)
}

function collectIds(editor: Editor, typeName: string): (string | null)[] {
  const ids: (string | null)[] = []

  editor.state.doc.descendants(node => {
    if (node.type.name === typeName) {
      ids.push(node.attrs.id ?? null)
    }
  })

  return ids
}

function collectCellPositions(editor: Editor): number[] {
  const positions: number[] = []

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
      positions.push(pos)
    }
  })

  return positions
}

describe('UniqueID', () => {
  let editor: Editor

  beforeEach(async () => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [StarterKit, UniqueID.configure({ types: ['heading', 'paragraph'] })],
      content: '<h1>Heading</h1><p>Paragraph one.</p><p>Paragraph two.</p>',
    })
    // UniqueID generates initial ids in onCreate via setTimeout(0)
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('assigns a unique id to headings', () => {
    const heading = editor.view.dom.querySelector('h1')
    expect(heading?.getAttribute('data-id')).toMatch(/.+/)
  })

  it('assigns a unique id to paragraphs', () => {
    const paragraphs = editor.view.dom.querySelectorAll('p')
    paragraphs.forEach(p => {
      expect(p.getAttribute('data-id')).toMatch(/.+/)
    })
  })

  it('gives different ids to different nodes', () => {
    const paragraphs = Array.from(editor.view.dom.querySelectorAll('p'))
    const ids = paragraphs.map(p => p.getAttribute('data-id'))
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('UniqueID paste', () => {
  let editor: Editor

  beforeEach(async () => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [StarterKit, UniqueID.configure({ types: ['heading', 'paragraph'] })],
      content: '<h1>Heading</h1><p>Paragraph one.</p>',
    })
    // UniqueID generates initial ids in onCreate via setTimeout(0)
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('gives pasted nodes ids without extra steps', () => {
    let appendedSteps = 0
    editor.on('transaction', ({ appendedTransactions }) => {
      appendedTransactions.forEach(tr => {
        appendedSteps += tr.steps.length
      })
    })

    pasteHTML(editor, '<p>One</p><p>Two</p><p>Three</p>')

    // The pasted nodes already carry ids, so appendTransaction adds no steps
    expect(appendedSteps).toBe(0)

    const ids = collectIds(editor, 'paragraph')
    expect(ids.length).toBeGreaterThanOrEqual(3)
    expect(ids.every(id => id !== null)).toBe(true)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps the old behavior for a custom generateID that reads pos', () => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    const customEditor = new Editor({
      element,
      extensions: [
        StarterKit,
        UniqueID.configure({
          types: ['paragraph'],
          generateID: ({ pos }) => `custom-${pos}`,
        }),
      ],
      content: '<p>Paragraph one.</p>',
    })

    let appendedSteps = 0
    customEditor.on('transaction', ({ appendedTransactions }) => {
      appendedTransactions.forEach(tr => {
        appendedSteps += tr.steps.length
      })
    })

    pasteHTML(customEditor, '<p>One</p><p>Two</p>')

    // A custom generateID may read pos, and a slice has no final positions
    // yet, so pasted nodes still get their ids from appendTransaction
    expect(appendedSteps).toBe(2)

    const ids = collectIds(customEditor, 'paragraph')
    expect(ids.every(id => id !== null && id.startsWith('custom-'))).toBe(true)
    expect(new Set(ids).size).toBe(ids.length)

    customEditor.destroy()
  })
})

describe('UniqueID paste into a cell selection', () => {
  let editor: Editor

  beforeEach(async () => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [
        Document,
        Paragraph,
        Text,
        TableKit,
        UniqueID.configure({ types: ['paragraph', 'tableCell'] }),
      ],
      content:
        '<table><tbody><tr><td><p>R1</p></td></tr><tr><td><p>R2</p></td></tr><tr><td><p>R3</p></td></tr></tbody></table>',
    })
    // UniqueID generates initial ids in onCreate via setTimeout(0)
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('does not duplicate ids when one copied row fills three selected rows', () => {
    const cells = collectCellPositions(editor)
    editor.chain().focus().setCellSelection({ anchorCell: cells[0], headCell: cells[2] }).run()

    pasteHTML(editor, '<table><tbody><tr><td><p>Copied</p></td></tr></tbody></table>')

    const cellIds = collectIds(editor, 'tableCell')
    expect(cellIds.length).toBe(3)
    expect(cellIds.every(id => id !== null)).toBe(true)
    expect(new Set(cellIds).size).toBe(cellIds.length)

    const paragraphIds = collectIds(editor, 'paragraph')
    expect(paragraphIds.every(id => id !== null)).toBe(true)
    expect(new Set(paragraphIds).size).toBe(paragraphIds.length)
  })
})
