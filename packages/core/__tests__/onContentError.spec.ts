import { Editor, Extension } from '@dibdab/core'
import Document from '@dibdab/extension-document'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { describe, expect, it } from 'vitest'

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
        expect(false).toBe(true)
      },
    })

    expect(editor.getText()).toBe('')
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
        expect(false).toBe(true)
      },
    })

    expect(editor.getText()).toBe('')
  })
  it('emits a contentError on invalid content (when enableContentCheck = true)', async () => {
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

    let contentErrorCalled = false
    let errorMessage = ''

    const editor = new Editor({
      content: json,
      extensions: [Document, Paragraph, Text],
      enableContentCheck: true,
      onContentError: ({ error }) => {
        contentErrorCalled = true
        errorMessage = error.message
      },
    })

    // Wait for async initialization to complete
    await new Promise<void>(resolve => {
      setTimeout(resolve, 0)
    })

    expect(contentErrorCalled).toBe(true)
    expect(errorMessage).toBe('[tiptap error]: Invalid JSON content')
    expect(editor.getText()).toBe('')
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
        expect(false).toBe(true)
      },
    })

    expect(editor.getText()).toBe('Example Text')
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
      extensions: [
        Document,
        Paragraph,
        Text,
        Extension.create({
          name: 'collaboration',
          addStorage() {
            return {
              isDisabled: false,
            }
          },
        }),
      ],
      enableContentCheck: true,
      onContentError: args => {
        args.disableCollaboration()
        expect(args.editor.storage.collaboration).toBe(undefined)
      },
    })

    expect(editor.getText()).toBe('')
    expect(editor.storage.collaboration).toBe(undefined)
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
      extensions: [
        Document,
        Paragraph,
        Text,
        Extension.create({
          name: 'collaboration',
          addStorage() {
            return {
              isDisabled: false,
            }
          },
        }),
      ],
      enableContentCheck: true,
      onContentError: () => {
        // Should not be called, so we fail the test
        expect(true).toBe(false)
      },
    })

    expect(editor.getText()).toBe('Example Text')
    expect(editor.storage.collaboration.isDisabled).toBe(false)
  })
})
