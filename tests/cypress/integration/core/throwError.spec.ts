/// <reference types="cypress" />

import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

describe('throwError', () => {
  it('does not emit an error on invalid content', () => {
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
      throwOnError: false,
      onError: () => {
        expect(false).to.eq(true)
      },
    })

    expect(editor.getText()).to.eq('')
  })
  it('emits an error on invalid content', done => {
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
      throwOnError: true,
      onError: ({ error }) => {
        expect(error.message).to.eq('Unknown node type: undefined')
        done()
      },
    })

    expect(editor.getText()).to.eq('')
  })
  it('emits an error on invalid content via setcontent', done => {
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
      extensions: [Document, Paragraph, Text],
      throwOnError: true,
      onError: ({ error }) => {
        expect(error.message).to.eq('Unknown node type: undefined')
        done()
      },
    })

    editor.commands.setContent(json)
  })
  it('emits an error on invalid content via setcontent with override', done => {
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
      extensions: [Document, Paragraph, Text],
      throwOnError: false,
      onError: ({ error }) => {
        expect(error.message).to.eq('Unknown node type: undefined')
        done()
      },
    })

    expect(editor.getText()).to.eq('')
    editor.commands.setContent(json, false, {}, true)
  })
  it('does not emit an error on valid content', () => {
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
      throwOnError: true,
      onError: () => {
        expect(false).to.eq(true)
      },
    })

    expect(editor.getText()).to.eq('Example Text')
  })
})
