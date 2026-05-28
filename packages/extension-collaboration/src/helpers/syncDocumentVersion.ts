import type { Doc } from 'yjs'

import type { Editor, EditorEvents } from '@tiptap/core'

export const TIPTAP_YDOC_MAP_KEY = 'tiptap'

/**
 * Syncs the editor's document version with a Yjs document map.
 * Returns an unsubscribe function.
 */
export function syncDocumentVersionWithYdoc(editor: Editor, document: Doc): () => void {
  const map = document.getMap(TIPTAP_YDOC_MAP_KEY)
  const storedVersion = map.get('documentVersion')

  if (typeof storedVersion === 'number') {
    editor.setDocumentVersion(storedVersion)
  } else {
    map.set('documentVersion', editor.getDocumentVersion())
  }

  const onMigrate = ({ newDocumentVersion }: EditorEvents['migrate']) => {
    map.set('documentVersion', newDocumentVersion)
  }

  editor.on('migrate', onMigrate)

  return () => {
    editor.off('migrate', onMigrate)
  }
}
