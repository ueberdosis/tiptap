import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { skipTrailingNodeMeta, TrailingNode } from '@tiptap/extensions'
import { afterEach, describe, expect, it } from 'vitest'

const headingDocument = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Title' }],
    },
  ],
}

const headingWithTrailingParagraphDocument = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Title' }],
    },
    {
      type: 'paragraph',
    },
  ],
}

describe('extension-trailing-node', () => {
  let editor: Editor | null = null

  const createEditor = () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Heading, TrailingNode],
      content: '<h1>Title</h1><p>End</p>',
    })
  }

  const deleteTrailingParagraph = (meta?: { key: string; value: unknown }) => {
    const headingSize = editor!.state.doc.firstChild!.nodeSize
    const transaction = editor!.state.tr.delete(headingSize, editor!.state.doc.content.size)

    if (meta) {
      transaction.setMeta(meta.key, meta.value)
    }

    editor!.view.dispatch(transaction)
  }

  afterEach(() => {
    if (editor) {
      editor.destroy()
      editor = null
    }
  })

  it('adds a trailing paragraph when the document ends with a heading', () => {
    createEditor()

    deleteTrailingParagraph()

    expect(editor!.getJSON()).toEqual(headingWithTrailingParagraphDocument)
  })

  it('skips trailing node insertion for unique id transactions', () => {
    createEditor()

    deleteTrailingParagraph({ key: '__uniqueIDTransaction', value: true })

    expect(editor!.getJSON()).toEqual(headingDocument)
  })

  it('only skips trailing node insertion for the current transaction cycle', () => {
    createEditor()

    deleteTrailingParagraph({ key: skipTrailingNodeMeta, value: true })

    expect(editor!.getJSON()).toEqual(headingDocument)

    editor!.commands.setTextSelection(1)

    expect(editor!.getJSON()).toEqual(headingWithTrailingParagraphDocument)
  })
})
