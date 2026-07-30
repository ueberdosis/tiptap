// @vitest-environment happy-dom
import { type Extensions, Editor, Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { UniqueID } from '../src/unique-id.js'

const ATTR = 'uniqueId'

let idCounter = 0
function generateID() {
  idCounter += 1
  return `test-id-${idCounter}`
}

function createEditor(options: { withCollaboration?: boolean } = {}) {
  idCounter = 0
  const extensions: Extensions = [
    Document,
    Paragraph,
    Text,
    UniqueID.configure({
      attributeName: ATTR,
      types: ['paragraph'],
      generateID,
    }),
  ]

  if (options.withCollaboration) {
    extensions.push(Extension.create({ name: 'collaboration' }))
  }

  return new Editor({ extensions })
}

/**
 * Minimal stand-in for a Hocuspocus/TiptapCloud provider's event emitter,
 * tracking how many `synced` listeners are currently attached.
 */
function createMockProvider() {
  const listeners: Record<string, ((...args: any[]) => void)[]> = {}

  return {
    on(event: string, cb: (...args: any[]) => void) {
      ;(listeners[event] ??= []).push(cb)
    },
    off(event: string, cb: (...args: any[]) => void) {
      listeners[event] = (listeners[event] ?? []).filter(fn => fn !== cb)
    },
    emit(event: string) {
      ;(listeners[event] ?? []).slice().forEach(fn => fn())
    },
    listenerCount(event: string) {
      return (listeners[event] ?? []).length
    },
  }
}

/**
 * Mirrors the common collaboration setup: the Collaboration extension carries
 * no provider (only the Y.Doc), while the provider lives on CollaborationCaret.
 */
function createCollabEditorWithProvider(provider: ReturnType<typeof createMockProvider>) {
  idCounter = 0

  return new Editor({
    extensions: [
      Document,
      Paragraph,
      Text,
      UniqueID.configure({
        attributeName: ATTR,
        types: ['paragraph'],
        generateID,
      }),
      Extension.create({ name: 'collaboration' }),
      Extension.create({ name: 'collaborationCaret' }).configure({ provider }),
    ],
  })
}

function getParagraphIds(editor: Editor): (string | null)[] {
  const ids: (string | null)[] = []

  editor.state.doc.descendants(node => {
    if (node.type.name === 'paragraph') {
      ids.push(node.attrs[ATTR] ?? null)
    }
  })
  return ids
}

describe('UniqueID collaboration handling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not assign IDs immediately when collaboration extension is present without provider', () => {
    const editor = createEditor({ withCollaboration: true })

    // Flush the setTimeout(0) that triggers onCreate
    vi.runAllTimers()

    const ids = getParagraphIds(editor)

    // All IDs should still be null because we deferred hashing
    expect(ids.length).toBeGreaterThan(0)
    expect(ids.every(id => id === null)).toBe(true)

    editor.destroy()
  })

  it('assigns IDs after y-sync$ transaction when collaboration has no provider', () => {
    const editor = createEditor({ withCollaboration: true })

    // Flush the setTimeout(0) that triggers onCreate
    vi.runAllTimers()

    // Verify no IDs yet
    expect(getParagraphIds(editor).every(id => id === null)).toBe(true)

    // Simulate a y-sync$ transaction (like Yjs would dispatch after syncing)
    const { tr } = editor.state
    tr.setMeta('y-sync$', true)
    // Insert a space to make the transaction have a doc change,
    // which triggers appendTransaction
    tr.insertText(' ', 1)
    editor.view.dispatch(tr)

    const ids = getParagraphIds(editor)

    // All paragraphs should now have unique IDs
    expect(ids.length).toBeGreaterThan(0)
    expect(ids.every(id => id !== null && typeof id === 'string')).toBe(true)

    // IDs should be unique
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)

    editor.destroy()
  })

  it('assigns IDs when y-sync$ transaction arrives before onCreate runs', () => {
    // Do NOT flush timers yet — onCreate has not run
    const editor = createEditor({ withCollaboration: true })

    // Dispatch a y-sync$ transaction before onCreate (before vi.runAllTimers)
    const { tr } = editor.state
    tr.setMeta('y-sync$', true)
    tr.insertText(' ', 1)
    editor.view.dispatch(tr)

    // IDs should already be assigned from the appendTransaction handler
    const idsBeforeOnCreate = getParagraphIds(editor)
    expect(idsBeforeOnCreate.length).toBeGreaterThan(0)
    expect(idsBeforeOnCreate.every(id => id !== null && typeof id === 'string')).toBe(true)

    // Now flush timers so onCreate runs — should not cause issues
    vi.runAllTimers()

    // IDs should still be present and unchanged
    const idsAfterOnCreate = getParagraphIds(editor)
    expect(idsAfterOnCreate).toEqual(idsBeforeOnCreate)

    editor.destroy()
  })

  it('detaches the provider "synced" listener when destroyed before syncing', () => {
    const provider = createMockProvider()
    const editor = createCollabEditorWithProvider(provider)

    // Flush the setTimeout(0) that triggers onCreate, which attaches the listener
    vi.runAllTimers()

    // While waiting for the provider to sync, exactly one listener is attached
    expect(provider.listenerCount('synced')).toBe(1)

    // Destroying before the provider syncs must detach the listener — otherwise
    // the createIds closure keeps the whole editor reachable from the shared
    // provider's emitter (the reported memory leak).
    editor.destroy()

    expect(provider.listenerCount('synced')).toBe(0)
  })

  it('detaches the provider "synced" listener after the provider syncs', () => {
    const provider = createMockProvider()
    const editor = createCollabEditorWithProvider(provider)

    vi.runAllTimers()
    expect(provider.listenerCount('synced')).toBe(1)

    // Provider syncs: createIds runs and removes its own listener
    provider.emit('synced')
    expect(provider.listenerCount('synced')).toBe(0)

    // All paragraphs should now have unique IDs
    const ids = getParagraphIds(editor)
    expect(ids.length).toBeGreaterThan(0)
    expect(ids.every(id => id !== null && typeof id === 'string')).toBe(true)

    // A later destroy must not throw or double-detach
    editor.destroy()
    expect(provider.listenerCount('synced')).toBe(0)
  })

  it('still assigns IDs immediately when no collaboration extension', () => {
    const editor = createEditor({ withCollaboration: false })

    // Flush the setTimeout(0) that triggers onCreate
    vi.runAllTimers()

    const ids = getParagraphIds(editor)

    // IDs should already be assigned (no collaboration = immediate)
    expect(ids.length).toBeGreaterThan(0)
    expect(ids.every(id => id !== null && typeof id === 'string')).toBe(true)

    editor.destroy()
  })
})
