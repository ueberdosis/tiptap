import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { GapCursor } from '@tiptap/pm/gapcursor'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { handleBackspace } from '../src/handleBackspace.js'
import { Blockquote } from '../src/index.js'

describe('Blockquote handleBackspace', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, Image, Blockquote],
      content: '<img src="https://example.com/image.png">',
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  // Regression test for https://github.com/ueberdosis/tiptap/issues/7973
  // With a leading image, pressing backspace at the very start of the document
  // resolved the caret to the top (doc) level, where `$from.depth` is 0. The
  // handler then dereferenced `$from.node(-1)` (undefined) and crashed with
  // `TypeError: can't access property "type", parent is undefined`.
  it('does not throw when backspacing at the very start of the document', () => {
    const { state, view } = editor
    // Before the leading image, the caret resolves to a gap cursor at depth 0.
    const selection = new GapCursor(state.doc.resolve(0))
    view.dispatch(state.tr.setSelection(selection))

    const blockquoteType = editor.schema.nodes.blockquote

    expect(() => handleBackspace(editor, blockquoteType)).not.toThrow()
    expect(handleBackspace(editor, blockquoteType)).toBe(false)
  })
})
