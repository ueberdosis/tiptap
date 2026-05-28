import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'
import { Doc } from 'yjs'

import { Collaboration } from '../src/collaboration.js'
import { TIPTAP_YDOC_MAP_KEY } from '../src/helpers/syncDocumentVersion.js'

describe('syncDocumentVersionWithYdoc', () => {
  it('writes documentVersion to the Yjs map after migration', () => {
    const ydoc = new Doc()

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Collaboration.configure({ document: ydoc })],
      data: {
        content: {
          type: 'doc',
          content: [
            {
              type: 'legacyParagraph',
              content: [{ type: 'text', text: 'Hello' }],
            },
          ],
        },
        documentVersion: 1,
        meta: {},
      },
      migrations: [
        {
          version: 2,
          migrate: node => {
            if (node.type === 'legacyParagraph') {
              return { ...node, type: 'paragraph' }
            }

            return node
          },
        },
      ],
    })

    expect(ydoc.getMap(TIPTAP_YDOC_MAP_KEY).get('documentVersion')).toBe(2)
    expect(editor.getDocumentVersion()).toBe(2)

    editor.destroy()
  })

  it('reads documentVersion from the Yjs map on create', () => {
    const ydoc = new Doc()

    ydoc.getMap(TIPTAP_YDOC_MAP_KEY).set('documentVersion', 5)

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Collaboration.configure({ document: ydoc })],
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello' }],
          },
        ],
      },
    })

    expect(editor.getDocumentVersion()).toBe(5)

    editor.destroy()
  })
})
