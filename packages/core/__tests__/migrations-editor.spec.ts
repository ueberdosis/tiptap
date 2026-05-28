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

  it('does not validate documentVersion when migrations are empty', () => {
    const onMigrateError = vi.fn()

    const editor = new Editor({
      extensions,
      content: {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
      },
      onMigrateError,
    })

    editor.setDocumentVersion(99)

    expect(onMigrateError).not.toHaveBeenCalled()
    expect(editor.getDocumentVersion()).toBe(99)
    expect(editor.isDestroyed).toBe(false)

    editor.destroy()
  })

  it('emits migrateError before throwing when migration versions are duplicated', () => {
    const onMigrateError = vi.fn()

    expect(() => {
      new Editor({
        extensions,
        data: {
          content: oldDoc,
          documentVersion: 1,
          meta: {},
        },
        migrations: [
          createMigration(2, [renameNode('legacyParagraph', 'paragraph')]),
          createMigration(2, [renameNode('paragraph', 'paragraph')]),
        ],
        onMigrateError,
      })
    }).toThrow('Duplicate migration versions')

    expect(onMigrateError).toHaveBeenCalledTimes(1)
    expect(onMigrateError.mock.calls[0][0].error.message).toContain('Duplicate migration versions')
  })

  it('emits migrateError before throwing when document version is too new on init', () => {
    const onMigrateError = vi.fn()

    expect(() => {
      new Editor({
        extensions,
        data: {
          content: {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
          },
          documentVersion: 99,
          meta: {},
        },
        migrations: [createMigration(2, [renameNode('legacyParagraph', 'paragraph')])],
        onMigrateError,
      })
    }).toThrow('Editor is outdated')

    expect(onMigrateError).toHaveBeenCalledTimes(1)
    expect(onMigrateError.mock.calls[0][0].error.message).toContain('Editor is outdated')
  })

  it('destroys the editor when document version becomes too new at runtime', () => {
    const onMigrateError = vi.fn()

    const editor = new Editor({
      extensions,
      data: {
        content: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
        },
        documentVersion: 2,
        meta: {},
      },
      migrations: [createMigration(2, [renameNode('legacyParagraph', 'paragraph')])],
      onMigrateError,
    })

    editor.setDocumentVersion(99)

    expect(onMigrateError).toHaveBeenCalledTimes(1)
    expect(onMigrateError.mock.calls[0][0].editor).toBe(editor)
    expect(editor.getDocumentVersion()).toBe(2)
    expect(editor.isDestroyed).toBe(true)
  })

  it('does not emit migrateError when setDocumentVersion receives the current version', () => {
    const onMigrateError = vi.fn()

    const editor = new Editor({
      extensions,
      data: {
        content: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
        },
        documentVersion: 2,
        meta: {},
      },
      migrations: [createMigration(2, [renameNode('legacyParagraph', 'paragraph')])],
      onMigrateError,
    })

    editor.setDocumentVersion(2)

    expect(onMigrateError).not.toHaveBeenCalled()
    expect(editor.isDestroyed).toBe(false)

    editor.destroy()
  })

  it('updates documentVersion when setDocumentVersion is within the supported migration range', () => {
    const onMigrateError = vi.fn()

    const editor = new Editor({
      extensions,
      data: {
        content: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
        },
        documentVersion: 1,
        meta: {},
      },
      migrations: [
        createMigration(2, [renameNode('legacyParagraph', 'paragraph')]),
        createMigration(5, [renameNode('paragraph', 'paragraph')]),
      ],
      onMigrateError,
    })

    editor.setDocumentVersion(5)

    expect(onMigrateError).not.toHaveBeenCalled()
    expect(editor.getDocumentVersion()).toBe(5)
    expect(editor.isDestroyed).toBe(false)

    editor.destroy()
  })

  it('ignores further setDocumentVersion calls after a fatal migration destroy', () => {
    const onMigrateError = vi.fn()

    const editor = new Editor({
      extensions,
      data: {
        content: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
        },
        documentVersion: 2,
        meta: {},
      },
      migrations: [createMigration(2, [renameNode('legacyParagraph', 'paragraph')])],
      onMigrateError,
    })

    editor.setDocumentVersion(99)

    expect(editor.isDestroyed).toBe(true)
    expect(editor.getDocumentVersion()).toBe(2)

    onMigrateError.mockClear()
    editor.setDocumentVersion(100)

    expect(onMigrateError).not.toHaveBeenCalled()
    expect(editor.getDocumentVersion()).toBe(2)
  })

  it('reports isDestroyed as false for an unmounted editor that is still alive', () => {
    const editor = new Editor({
      extensions,
      content: {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
      },
    })

    expect(editor.isDestroyed).toBe(false)

    editor.destroy()
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
