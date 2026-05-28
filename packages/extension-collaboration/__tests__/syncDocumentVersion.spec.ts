import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as Y from 'yjs'
import { Doc, XmlElement, XmlText } from 'yjs'

import { Collaboration } from '../src/collaboration.js'
import {
  syncDocumentVersionWithYdoc,
  TIPTAP_DOCUMENT_VERSION_MAP_KEY,
  TIPTAP_DOCUMENT_VERSION_VALUE_KEY,
} from '../src/helpers/syncDocumentVersion.js'

function setYjsDocumentVersion(doc: Doc, version: number) {
  doc.getMap(TIPTAP_DOCUMENT_VERSION_MAP_KEY).set(TIPTAP_DOCUMENT_VERSION_VALUE_KEY, version)
}

function getYjsDocumentVersion(doc: Doc): unknown {
  return doc.getMap(TIPTAP_DOCUMENT_VERSION_MAP_KEY).get(TIPTAP_DOCUMENT_VERSION_VALUE_KEY)
}

function readXmlFragmentText(doc: Doc, field = 'default'): string {
  const parts: string[] = []

  const walk = (node: Y.XmlFragment | XmlElement) => {
    node.forEach(child => {
      if (child instanceof XmlText) {
        parts.push(child.toString())
      } else if (child instanceof XmlElement) {
        walk(child)
      }
    })
  }

  walk(doc.getXmlFragment(field))
  return parts.join('')
}

function mirrorYjsUpdates(source: Doc, target: Doc) {
  source.on('update', (update: Uint8Array) => {
    Y.applyUpdate(target, update)
  })
}

describe('syncDocumentVersionWithYdoc', () => {
  const mountedElements: HTMLElement[] = []

  afterEach(() => {
    mountedElements.forEach(element => {
      element.remove()
    })
    mountedElements.length = 0
  })
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

    expect(getYjsDocumentVersion(ydoc)).toBe(2)
    expect(editor.getDocumentVersion()).toBe(2)

    editor.destroy()
  })

  it('reads documentVersion from the Yjs map on create', () => {
    const ydoc = new Doc()

    setYjsDocumentVersion(ydoc, 5)

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

  it('runs migration validation when the Yjs documentVersion changes after mount', () => {
    const ydoc = new Doc()
    const onMigrateError = vi.fn()

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Collaboration.configure({ document: ydoc })],
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
    })

    setYjsDocumentVersion(ydoc, 99)

    expect(onMigrateError).toHaveBeenCalledTimes(1)
    expect(editor.getDocumentVersion()).toBe(2)

    editor.destroy()
  })

  it('destroys the editor before local edits can sync to other Yjs clients', async () => {
    const ydoc = new Doc()
    const remoteYdoc = new Doc()

    mirrorYjsUpdates(ydoc, remoteYdoc)

    setYjsDocumentVersion(ydoc, 2)

    const element = document.createElement('div')

    document.body.appendChild(element)
    mountedElements.push(element)

    const onMigrateError = vi.fn()
    const onDestroy = vi.fn()

    let editor!: Editor
    let hasSyncedToYjs = false

    ydoc.on('update', () => {
      hasSyncedToYjs = true
    })

    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, Collaboration.configure({ document: ydoc })],
      migrations: [
        {
          version: 2,
          migrate: node => node,
        },
      ],
      onMigrateError,
      onDestroy,
      onCreate: ({ editor: createdEditor }) => {
        createdEditor.commands.setContent('<p>Hello</p>')
      },
    })

    await vi.waitFor(() => {
      expect(hasSyncedToYjs).toBe(true)
      expect(editor.getText()).toContain('Hello')
    })

    const remoteFragment = remoteYdoc.getXmlFragment('default')
    let remoteFragmentUpdates = 0

    const stopObserving = () => {
      remoteFragment.unobserveDeep(onRemoteFragmentChange)
    }

    const onRemoteFragmentChange = () => {
      remoteFragmentUpdates += 1
    }

    remoteFragment.observeDeep(onRemoteFragmentChange)

    setYjsDocumentVersion(ydoc, 99)

    expect(onMigrateError).toHaveBeenCalledTimes(1)
    expect(onDestroy).toHaveBeenCalledTimes(1)
    expect(editor.isDestroyed).toBe(true)

    remoteFragmentUpdates = 0

    const remoteStateAfterBump = Y.encodeStateAsUpdate(remoteYdoc)

    let insertSucceeded = false

    try {
      insertSucceeded = editor.commands.insertContent({
        type: 'text',
        text: 'LEAKED_TO_PEERS',
      })
    } catch {
      insertSucceeded = false
    }

    expect(insertSucceeded).toBe(false)

    await new Promise<void>(resolve => {
      setTimeout(resolve, 50)
    })

    expect(remoteFragmentUpdates).toBe(0)
    expect(Y.encodeStateAsUpdate(remoteYdoc)).toEqual(remoteStateAfterBump)
    expect(readXmlFragmentText(remoteYdoc)).not.toContain('LEAKED_TO_PEERS')

    stopObserving()

    editor.destroy()
  })

  it('applies compatible Yjs documentVersion updates without destroying the editor', () => {
    const ydoc = new Doc()
    const onMigrateError = vi.fn()

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Collaboration.configure({ document: ydoc })],
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
        documentVersion: 2,
        meta: {},
      },
      migrations: [
        { version: 2, migrate: node => node },
        { version: 5, migrate: node => node },
      ],
      onMigrateError,
    })

    setYjsDocumentVersion(ydoc, 4)

    expect(onMigrateError).not.toHaveBeenCalled()
    expect(editor.getDocumentVersion()).toBe(4)
    expect(editor.isDestroyed).toBe(false)

    editor.destroy()
  })

  it('does not react to Yjs updates after the editor is destroyed', () => {
    const ydoc = new Doc()
    const onMigrateError = vi.fn()

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Collaboration.configure({ document: ydoc })],
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
        documentVersion: 2,
        meta: {},
      },
      migrations: [{ version: 2, migrate: node => node }],
      onMigrateError,
    })

    editor.destroy()
    onMigrateError.mockClear()

    setYjsDocumentVersion(ydoc, 99)

    expect(onMigrateError).not.toHaveBeenCalled()
  })

  it('ignores observer callbacks when the stored version is unchanged', () => {
    const ydoc = new Doc()
    const onMigrateError = vi.fn()

    setYjsDocumentVersion(ydoc, 3)

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Collaboration.configure({ document: ydoc })],
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
        documentVersion: 3,
        meta: {},
      },
      migrations: [
        { version: 3, migrate: node => node },
        { version: 5, migrate: node => node },
      ],
      onMigrateError,
    })

    onMigrateError.mockClear()
    setYjsDocumentVersion(ydoc, 3)

    expect(onMigrateError).not.toHaveBeenCalled()
    expect(editor.getDocumentVersion()).toBe(3)

    editor.destroy()
  })

  it('stops observing the Yjs map after unsubscribe is called', () => {
    const ydoc = new Doc()
    const onMigrateError = vi.fn()

    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
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
        documentVersion: 2,
        meta: {},
      },
      migrations: [{ version: 2, migrate: node => node }],
      onMigrateError,
    })

    const unsubscribe = syncDocumentVersionWithYdoc(editor, ydoc)

    unsubscribe()
    onMigrateError.mockClear()

    setYjsDocumentVersion(ydoc, 99)

    expect(onMigrateError).not.toHaveBeenCalled()
    expect(editor.getDocumentVersion()).toBe(2)
    expect(editor.isDestroyed).toBe(false)

    editor.destroy()
  })

  it('emits migrateError when Collaboration reads a newer Yjs version on init', () => {
    const ydoc = new Doc()
    const onMigrateError = vi.fn()

    setYjsDocumentVersion(ydoc, 99)

    expect(() => {
      new Editor({
        extensions: [Document, Paragraph, Text, Collaboration.configure({ document: ydoc })],
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
        migrations: [{ version: 2, migrate: node => node }],
        onMigrateError,
      })
    }).toThrow('Editor is outdated')

    expect(onMigrateError).toHaveBeenCalledTimes(1)
  })
})
