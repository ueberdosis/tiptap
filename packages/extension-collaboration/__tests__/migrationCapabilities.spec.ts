import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Doc } from 'yjs'

import { Collaboration } from '../src/collaboration.js'
import {
  getCollabMigrationCapabilities,
  syncMigrationCapabilitiesToAwareness,
  TIPTAP_AWARENESS_MIGRATION_KEY,
} from '../src/helpers/migrationCapabilities.js'

const extensions = [Document, Paragraph, Text]

describe('getCollabMigrationCapabilities', () => {
  it('returns disabled capabilities when migrations are empty', () => {
    expect(getCollabMigrationCapabilities([])).toEqual({
      migrationsEnabled: false,
      maxMigrationVersion: null,
    })
  })

  it('returns disabled capabilities when migrations are undefined', () => {
    expect(getCollabMigrationCapabilities()).toEqual({
      migrationsEnabled: false,
      maxMigrationVersion: null,
    })
  })

  it('returns the highest migration version when migrations are configured', () => {
    expect(
      getCollabMigrationCapabilities([
        { version: 2, migrate: node => node },
        { version: 5, migrate: node => node },
      ]),
    ).toEqual({
      migrationsEnabled: true,
      maxMigrationVersion: 5,
    })
  })
})

describe('syncMigrationCapabilitiesToAwareness', () => {
  it('writes capabilities to the tiptap awareness field', () => {
    const setLocalStateField = vi.fn()
    const provider = { awareness: { setLocalStateField } }

    syncMigrationCapabilitiesToAwareness(provider, {
      migrationsEnabled: true,
      maxMigrationVersion: 3,
    })

    expect(setLocalStateField).toHaveBeenCalledWith(TIPTAP_AWARENESS_MIGRATION_KEY, {
      migrationsEnabled: true,
      maxMigrationVersion: 3,
    })
  })
})

describe('Collaboration migration capabilities', () => {
  const mountedElements: HTMLElement[] = []

  afterEach(() => {
    mountedElements.forEach(element => element.remove())
    mountedElements.length = 0
  })

  async function createMountedEditor(options: ConstructorParameters<typeof Editor>[0]) {
    const element = document.createElement('div')

    document.body.appendChild(element)
    mountedElements.push(element)

    const editor = new Editor({
      ...options,
      element,
    })

    await new Promise<void>(resolve => {
      setTimeout(resolve, 0)
    })

    return editor
  }

  it('publishes capabilities to provider awareness when migrations are configured', async () => {
    const ydoc = new Doc()
    const setLocalStateField = vi.fn()
    const provider = { awareness: { setLocalStateField } }

    const editor = await createMountedEditor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Collaboration.configure({ document: ydoc, provider }),
      ],
      migrations: [
        { version: 2, migrate: node => node },
        { version: 7, migrate: node => node },
      ],
    })

    expect(setLocalStateField).toHaveBeenCalledWith(TIPTAP_AWARENESS_MIGRATION_KEY, {
      migrationsEnabled: true,
      maxMigrationVersion: 7,
    })
    expect(editor.storage.collaboration.migrationCapabilities).toEqual({
      migrationsEnabled: true,
      maxMigrationVersion: 7,
    })

    editor.destroy()
  })

  it('publishes disabled capabilities when migrations are not configured', async () => {
    const ydoc = new Doc()
    const setLocalStateField = vi.fn()
    const provider = { awareness: { setLocalStateField } }

    const editor = await createMountedEditor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Collaboration.configure({ document: ydoc, provider }),
      ],
      content: '<p>Hello</p>',
    })

    expect(setLocalStateField).toHaveBeenCalledWith(TIPTAP_AWARENESS_MIGRATION_KEY, {
      migrationsEnabled: false,
      maxMigrationVersion: null,
    })
    expect(editor.storage.collaboration.migrationCapabilities).toEqual({
      migrationsEnabled: false,
      maxMigrationVersion: null,
    })

    editor.destroy()
  })

  it('does not publish capabilities when syncMigrationCapabilities is disabled', async () => {
    const ydoc = new Doc()
    const setLocalStateField = vi.fn()
    const provider = { awareness: { setLocalStateField } }

    const editor = await createMountedEditor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Collaboration.configure({
          document: ydoc,
          provider,
          syncMigrationCapabilities: false,
        }),
      ],
      migrations: [{ version: 2, migrate: node => node }],
    })

    expect(setLocalStateField).not.toHaveBeenCalled()
    expect(editor.storage.collaboration.migrationCapabilities).toBeUndefined()

    editor.destroy()
  })

  it('does not publish capabilities when no provider is configured', async () => {
    const ydoc = new Doc()

    const editor = await createMountedEditor({
      extensions: [Document, Paragraph, Text, Collaboration.configure({ document: ydoc })],
      migrations: [{ version: 2, migrate: node => node }],
    })

    expect(editor.storage.collaboration.migrationCapabilities).toBeUndefined()

    editor.destroy()
  })
})
