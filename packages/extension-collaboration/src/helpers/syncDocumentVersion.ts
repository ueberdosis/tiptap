import type { Doc } from 'yjs'

import type { Editor, EditorEvents } from '@tiptap/core'

/** Yjs map name for the shared document schema version. */
export const TIPTAP_DOCUMENT_VERSION_MAP_KEY = 'tiptap__documentVersion'

/** Key inside {@link TIPTAP_DOCUMENT_VERSION_MAP_KEY} that holds the version number. */
export const TIPTAP_DOCUMENT_VERSION_VALUE_KEY = 'value'

/**
 * @deprecated Use {@link TIPTAP_DOCUMENT_VERSION_MAP_KEY} and {@link TIPTAP_DOCUMENT_VERSION_VALUE_KEY}.
 */
export const TIPTAP_YDOC_MAP_KEY = 'tiptap'

function readStoredDocumentVersion(document: Doc): number | undefined {
  const storedVersion = document
    .getMap(TIPTAP_DOCUMENT_VERSION_MAP_KEY)
    .get(TIPTAP_DOCUMENT_VERSION_VALUE_KEY)

  if (typeof storedVersion === 'number') {
    return storedVersion
  }

  return undefined
}

function writeStoredDocumentVersion(document: Doc, version: number): void {
  document.getMap(TIPTAP_DOCUMENT_VERSION_MAP_KEY).set(TIPTAP_DOCUMENT_VERSION_VALUE_KEY, version)
}

/**
 * Syncs the editor's document version with a Yjs document map.
 * Returns an unsubscribe function.
 */
export function syncDocumentVersionWithYdoc(editor: Editor, document: Doc): () => void {
  const map = document.getMap(TIPTAP_DOCUMENT_VERSION_MAP_KEY)

  const applyStoredVersion = () => {
    const storedVersion = readStoredDocumentVersion(document)

    if (storedVersion !== undefined) {
      editor.setDocumentVersion(storedVersion)
    } else {
      writeStoredDocumentVersion(document, editor.getDocumentVersion())
    }
  }

  applyStoredVersion()

  const onMapChange = () => {
    const storedVersion = readStoredDocumentVersion(document)

    if (storedVersion !== undefined) {
      editor.setDocumentVersion(storedVersion)
    }
  }

  const onMigrate = ({ newDocumentVersion }: EditorEvents['migrate']) => {
    writeStoredDocumentVersion(document, newDocumentVersion)
  }

  map.observe(onMapChange)
  editor.on('migrate', onMigrate)

  return () => {
    map.unobserve(onMapChange)
    editor.off('migrate', onMigrate)
  }
}
