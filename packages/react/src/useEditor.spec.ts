import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { compareUseEditorOptions, useEditor } from './useEditor.js'

const extensions = [Document, Paragraph, Text]

const content = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
} as const

describe('compareUseEditorOptions', () => {
  const baseOptions = {
    extensions,
    data: {
      content,
      documentVersion: 2,
      meta: {},
    },
    migrations: [{ version: 2, migrate: (node: { type: string }) => node }],
  }

  it('treats different data.documentVersion values as a change', () => {
    expect(
      compareUseEditorOptions(baseOptions, {
        ...baseOptions,
        data: { ...baseOptions.data!, documentVersion: 3 },
      }),
    ).toBe(false)
  })

  it('treats different data.content references as a change', () => {
    expect(
      compareUseEditorOptions(baseOptions, {
        ...baseOptions,
        data: {
          ...baseOptions.data!,
          content: {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Changed' }] }],
          },
        },
      }),
    ).toBe(false)
  })

  it('treats different migrations array references as a change', () => {
    expect(
      compareUseEditorOptions(baseOptions, {
        ...baseOptions,
        migrations: [{ version: 2, migrate: (node: { type: string }) => node }],
      }),
    ).toBe(false)
  })

  it('ignores callback identity changes', () => {
    expect(
      compareUseEditorOptions(
        { ...baseOptions, onUpdate: () => undefined },
        { ...baseOptions, onUpdate: () => undefined },
      ),
    ).toBe(true)
  })
})

describe('useEditor migration errors', () => {
  it('returns null and calls onMigrateError when the document version is too new on init', async () => {
    const onMigrateError = vi.fn()

    const { result } = renderHook(() =>
      useEditor({
        extensions,
        data: {
          content,
          documentVersion: 99,
          meta: {},
        },
        migrations: [
          {
            version: 2,
            migrate: node => node,
          },
        ],
        onMigrateError,
      }),
    )

    await waitFor(() => {
      expect(result.current).toBeNull()
    })

    expect(onMigrateError).toHaveBeenCalled()
  })

  it('clears the editor ref when core destroys the instance at runtime', async () => {
    const onMigrateError = vi.fn()

    const { result } = renderHook(() =>
      useEditor({
        extensions,
        data: {
          content,
          documentVersion: 2,
          meta: {},
        },
        migrations: [
          {
            version: 2,
            migrate: node => node,
          },
        ],
        onMigrateError,
      }),
    )

    await waitFor(() => {
      expect(result.current).not.toBeNull()
    })

    result.current!.setDocumentVersion(99)

    await waitFor(() => {
      expect(result.current).toBeNull()
    })

    expect(onMigrateError).toHaveBeenCalled()
  })

  it('does not recreate the editor after a migration error until deps change', async () => {
    const onMigrateError = vi.fn()

    const { result, rerender } = renderHook(
      ({ documentVersion }) =>
        useEditor(
          {
            extensions,
            data: {
              content,
              documentVersion,
              meta: {},
            },
            migrations: [{ version: 5, migrate: node => node }],
            onMigrateError,
          },
          [documentVersion],
        ),
      { initialProps: { documentVersion: 2 } },
    )

    await waitFor(() => {
      expect(result.current).not.toBeNull()
    })

    result.current!.setDocumentVersion(99)

    await waitFor(() => {
      expect(result.current).toBeNull()
    })

    rerender({ documentVersion: 2 })

    await waitFor(() => {
      expect(result.current).toBeNull()
    })

    expect(onMigrateError).toHaveBeenCalled()
  })

  it('recreates the editor after a migration error when deps change back to a compatible version', async () => {
    const onMigrateError = vi.fn()

    const { result, rerender } = renderHook(
      ({ documentVersion }) =>
        useEditor(
          {
            extensions,
            data: {
              content,
              documentVersion,
              meta: {},
            },
            migrations: [{ version: 5, migrate: node => node }],
            onMigrateError,
          },
          [documentVersion],
        ),
      { initialProps: { documentVersion: 2 } },
    )

    await waitFor(() => {
      expect(result.current).not.toBeNull()
    })

    result.current!.setDocumentVersion(99)

    await waitFor(() => {
      expect(result.current).toBeNull()
    })

    rerender({ documentVersion: 3 })

    await waitFor(() => {
      expect(result.current).not.toBeNull()
      expect(result.current!.isDestroyed).toBe(false)
      expect(result.current!.getDocumentVersion()).toBeLessThanOrEqual(5)
    })

    expect(onMigrateError).toHaveBeenCalled()
  })

  it('calls the user onDestroy callback when core destroys the editor', async () => {
    const onDestroy = vi.fn()
    const onMigrateError = vi.fn()

    const { result } = renderHook(() =>
      useEditor({
        extensions,
        data: {
          content,
          documentVersion: 2,
          meta: {},
        },
        migrations: [{ version: 2, migrate: node => node }],
        onDestroy,
        onMigrateError,
      }),
    )

    await waitFor(() => {
      expect(result.current).not.toBeNull()
    })

    result.current!.setDocumentVersion(99)

    await waitFor(() => {
      expect(onDestroy).toHaveBeenCalledTimes(1)
    })
  })
})
