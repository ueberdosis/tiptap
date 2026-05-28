import { describe, expect, it, vi } from 'vitest'
import { Editor } from '../src/Editor.js'
import { createMigration, removeNode, renameNode } from '../src/features/migrations/index.js'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

const extensions = [Document, Paragraph, Text]

const oldDoc = {
  type: 'doc',
  content: [
    {
      type: 'legacyParagraph',
      content: [{ type: 'text', text: 'Hello' }],
    },
  ],
}

describe('Editor migrations', () => {
  it('emits migrate with the document snapshot before each version', () => {
    const onMigrate = vi.fn()

    new Editor({
      extensions,
      data: {
        content: oldDoc,
        documentVersion: 1,
        meta: {},
      },
      migrations: [
        createMigration(2, [renameNode('legacyParagraph', 'paragraph')]),
        createMigration(3, [renameNode('paragraph', 'paragraph')]),
      ],
      onMigrate,
    })

    expect(onMigrate).toHaveBeenCalledTimes(2)
    expect(onMigrate.mock.calls[0][0].oldDocument).toEqual(oldDoc)
    expect(onMigrate.mock.calls[1][0].oldDocument.content?.[0].type).toBe('paragraph')
  })

  it('emits migrateError when migration fails', () => {
    const onMigrateError = vi.fn()

    expect(() => {
      new Editor({
        extensions,
        data: {
          content: oldDoc,
          documentVersion: 1,
          meta: {},
        },
        migrations: [createMigration(2, [removeNode('doc')])],
        onMigrateError,
      })
    }).toThrow('[tiptap error]: Migration removed document root')

    expect(onMigrateError).toHaveBeenCalledTimes(1)
    expect(onMigrateError.mock.calls[0][0].error.message).toContain(
      'Migration removed document root',
    )
  })

  it('runs migrations via setContent when migrate is enabled', () => {
    const editor = new Editor({
      extensions,
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Initial' }],
          },
        ],
      },
      migrations: [createMigration(2, [renameNode('legacyParagraph', 'paragraph')])],
    })

    editor.commands.setContent(oldDoc, { migrate: true, documentVersion: 1 })

    expect(editor.getJSON().content?.[0].type).toBe('paragraph')
    expect(editor.getDocumentVersion()).toBe(2)
  })

  it('emits contentError when migrated content is invalid for the schema', () => {
    const onContentError = vi.fn()

    new Editor({
      extensions,
      enableContentCheck: true,
      emitContentError: true,
      data: {
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Hello' }],
            },
          ],
        },
        documentVersion: 1,
        meta: {},
      },
      migrations: [createMigration(2, [renameNode('paragraph', 'unknownNodeType')])],
      onContentError,
    })

    expect(onContentError).toHaveBeenCalled()
  })
})
