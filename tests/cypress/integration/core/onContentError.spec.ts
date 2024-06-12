/// <reference types="cypress" />

import { Editor, Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

describe('onContentError', () => {
  it('does not emit a contentError on invalid content (by default)', () => {
    const json = {
      invalid: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
            },
          ],
        },
      ],
    }

    const editor = new Editor({
      content: json,
      extensions: [Document, Paragraph, Text],
      onContentError: () => {
        expect(false).to.eq(true)
      },
    })

    expect(editor.getText()).to.eq('')
  })
  it('does not emit a contentError on invalid content (when enableContentCheck = false)', () => {
    const json = {
      invalid: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
            },
          ],
        },
      ],
    }

    const editor = new Editor({
      content: json,
      extensions: [Document, Paragraph, Text],
      enableContentCheck: false,
      onContentError: () => {
        expect(false).to.eq(true)
      },
    })

    expect(editor.getText()).to.eq('')
  })
  it('emits a contentError on invalid content (when enableContentCheck = true)', done => {
    const json = {
      invalid: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
            },
          ],
        },
      ],
    }

    const editor = new Editor({
      content: json,
      extensions: [Document, Paragraph, Text],
      enableContentCheck: true,
      onContentError: ({ error }) => {
        expect(error.message).to.eq('[tiptap error]: Invalid JSON content')
        done()
      },
    })

    expect(editor.getText()).to.eq('')
  })

  it('does not emit a contentError on valid content', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
            },
          ],
        },
      ],
    }

    const editor = new Editor({
      content: json,
      extensions: [Document, Paragraph, Text],
      enableContentCheck: true,
      onContentError: () => {
        expect(false).to.eq(true)
      },
    })

    expect(editor.getText()).to.eq('Example Text')
  })

  it('removes the collaboration extension when has invalid content (when enableContentCheck = true)', () => {
    const json = {
      invalid: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
            },
          ],
        },
      ],
    }

    const editor = new Editor({
      content: json,
      extensions: [Document, Paragraph, Text, Extension.create({ name: 'collaboration' })],
      enableContentCheck: true,
      onContentError: args => {
        args.disableCollaboration()
        expect(args.editor.extensionManager.extensions.find(extension => extension.name === 'collaboration')).to.eq(undefined)
      },
    })

    expect(editor.getText()).to.eq('')
    expect(editor.extensionManager.extensions.find(extension => extension.name === 'collaboration')).to.eq(undefined)
  })

  it('does not remove the collaboration extension when has valid content (when enableContentCheck = true)', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
            },
          ],
        },
      ],
    }

    const editor = new Editor({
      content: json,
      extensions: [Document, Paragraph, Text, Extension.create({ name: 'collaboration' })],
      enableContentCheck: true,
      onContentError: () => {
        expect(true).to.eq(false)
      },
    })

    expect(editor.getText()).to.eq('Example Text')
    expect(editor.extensionManager.extensions.find(extension => extension.name === 'collaboration')).to.not.eq(undefined)
  })
})
