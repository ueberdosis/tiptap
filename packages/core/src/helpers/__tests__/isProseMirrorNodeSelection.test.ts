import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { NodeSelection, TextSelection } from '@tiptap/pm/state'
import { describe, expect, it } from 'vitest'

import { isProseMirrorNodeSelection } from '../isProseMirrorNodeSelection.js'

function createDoc() {
  const editor = new Editor({
    extensions: [Document, Paragraph, Text],
    content: '<p>hello</p>',
  })
  const doc = editor.state.doc
  editor.destroy()

  return doc
}

describe('isProseMirrorNodeSelection', () => {
  it('returns true for a node selection', () => {
    expect(isProseMirrorNodeSelection(NodeSelection.create(createDoc(), 1))).toBe(true)
  })

  it('returns false for other selections and values', () => {
    expect(isProseMirrorNodeSelection(TextSelection.create(createDoc(), 2))).toBe(false)
    expect(isProseMirrorNodeSelection(null)).toBe(false)
    expect(isProseMirrorNodeSelection(undefined)).toBe(false)
    expect(isProseMirrorNodeSelection('selection')).toBe(false)
    expect(isProseMirrorNodeSelection(42)).toBe(false)
    expect(isProseMirrorNodeSelection({ node: undefined })).toBe(false)
    expect(isProseMirrorNodeSelection({ node: null })).toBe(false)
  })
})
