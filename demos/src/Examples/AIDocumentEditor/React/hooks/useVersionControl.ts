import type { Editor, JSONContent } from '@tiptap/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { eventBus } from '../services/event-bus'
import { useEditorStore } from '../stores/editor-store'
import type { DocumentVersion, Section, SectionStatus } from '../types'

// Simple ID generator
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// IndexedDB helpers
const DB_NAME = 'scyai-editor'
const DB_VERSION = 1
const VERSIONS_STORE = 'versions'

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(VERSIONS_STORE)) {
        const store = db.createObjectStore(VERSIONS_STORE, { keyPath: 'id' })
        store.createIndex('fragmentId', 'fragmentId', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
  })
}

async function saveVersionToDB(version: DocumentVersion & { fragmentId: string }): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(VERSIONS_STORE, 'readwrite')
    const store = transaction.objectStore(VERSIONS_STORE)
    const request = store.put(version)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

async function loadVersionsFromDB(fragmentId: string): Promise<DocumentVersion[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(VERSIONS_STORE, 'readonly')
    const store = transaction.objectStore(VERSIONS_STORE)
    const index = store.index('fragmentId')
    const request = index.getAll(fragmentId)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const versions = request.result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      resolve(versions)
    }
  })
}

interface UseVersionControlOptions {
  editor: Editor | null
  fragmentId: string
  onVersionSaved?: (version: DocumentVersion) => void
}

interface UseVersionControlReturn {
  versions: DocumentVersion[]
  currentVersion: DocumentVersion | null
  hasUnsavedChanges: boolean
  isSaving: boolean
  saveVersion: (label?: string, createdBy?: 'user' | 'ai') => Promise<void>
  discardChanges: () => void
  restoreVersion: (versionId: string) => void
  getNextVersionNumber: () => string
}

/**
 * Count words in document
 */
function countWords(doc: JSONContent): number {
  let count = 0
  function traverse(node: JSONContent) {
    if (node.text) {
      count += node.text.split(/\s+/).filter(w => w.length > 0).length
    }
    if (node.content) {
      node.content.forEach(traverse)
    }
  }
  traverse(doc)
  return count
}

/**
 * Extract section state from document
 */
function extractSectionState(doc: JSONContent): Record<string, SectionStatus> {
  const state: Record<string, SectionStatus> = {}
  let sectionIndex = 0

  function traverse(node: JSONContent) {
    if (node.type === 'heading' && (node.attrs?.level === 1 || node.attrs?.level === 2)) {
      const title = node.content?.[0]?.text || `Section ${sectionIndex}`
      state[`section-${sectionIndex}`] = 'pending'
      sectionIndex++
    }
    if (node.content) {
      node.content.forEach(traverse)
    }
  }

  traverse(doc)
  return state
}

export function useVersionControl({
  editor,
  fragmentId,
  onVersionSaved,
}: UseVersionControlOptions): UseVersionControlReturn {
  const [isSaving, setIsSaving] = useState(false)
  const lastSavedContentRef = useRef<JSONContent | null>(null)

  const { versions, currentVersionId, hasUnsavedChanges, addVersion, setCurrentVersion, setHasUnsavedChanges } =
    useEditorStore()

  const currentVersion = versions.find(v => v.id === currentVersionId) || null

  // Load versions from IndexedDB on mount
  useEffect(() => {
    if (!fragmentId) return

    loadVersionsFromDB(fragmentId)
      .then(loadedVersions => {
        loadedVersions.forEach(v => {
          if (!versions.find(existing => existing.id === v.id)) {
            addVersion(v)
          }
        })
        if (loadedVersions.length > 0) {
          const latest = loadedVersions[loadedVersions.length - 1]
          setCurrentVersion(latest.id)
          lastSavedContentRef.current = latest.content
        }
      })
      .catch(err => {
        console.error('Failed to load versions from IndexedDB:', err)
      })
  }, [fragmentId])

  // Track changes
  useEffect(() => {
    if (!editor) return

    const checkChanges = () => {
      const currentContent = editor.getJSON()
      const hasChanges =
        lastSavedContentRef.current !== null &&
        JSON.stringify(currentContent) !== JSON.stringify(lastSavedContentRef.current)
      setHasUnsavedChanges(hasChanges)
    }

    // Debounced change detection
    let timeout: NodeJS.Timeout
    const handleUpdate = () => {
      clearTimeout(timeout)
      timeout = setTimeout(checkChanges, 500)
    }

    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
      clearTimeout(timeout)
    }
  }, [editor, setHasUnsavedChanges])

  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const getNextVersionNumber = useCallback((): string => {
    if (versions.length === 0) return '0'

    const lastVersion = versions[versions.length - 1]
    const parts = lastVersion.version.split('.')

    if (parts.length === 1) {
      // Going from "0" to "0.1"
      return `${parts[0]}.1`
    } else {
      // Increment minor version
      const major = parts[0]
      const minor = parseInt(parts[1], 10) + 1
      return `${major}.${minor}`
    }
  }, [versions])

  const saveVersion = useCallback(
    async (label?: string, createdBy: 'user' | 'ai' = 'user') => {
      if (!editor || isSaving) return

      setIsSaving(true)

      try {
        const content = editor.getJSON()
        const versionNumber = getNextVersionNumber()

        const newVersion: DocumentVersion = {
          id: generateId(),
          version: versionNumber,
          content,
          createdAt: new Date(),
          createdBy,
          label,
          parentId: currentVersionId,
          metadata: {
            wordCount: countWords(content),
            sectionState: extractSectionState(content),
          },
        }

        // Save to IndexedDB
        await saveVersionToDB({ ...newVersion, fragmentId })

        // Update store
        addVersion(newVersion)
        lastSavedContentRef.current = content

        // Emit event
        eventBus.emit('version:saved', {
          fragmentId,
          version: newVersion,
        })

        onVersionSaved?.(newVersion)
      } catch (error) {
        console.error('Failed to save version:', error)
        throw error
      } finally {
        setIsSaving(false)
      }
    },
    [editor, isSaving, fragmentId, currentVersionId, getNextVersionNumber, addVersion, onVersionSaved],
  )

  const discardChanges = useCallback(() => {
    if (!editor || !currentVersion) return

    editor.commands.setContent(currentVersion.content)
    lastSavedContentRef.current = currentVersion.content
    setHasUnsavedChanges(false)
  }, [editor, currentVersion, setHasUnsavedChanges])

  const restoreVersion = useCallback(
    (versionId: string) => {
      if (!editor) return

      const version = versions.find(v => v.id === versionId)
      if (!version) return

      editor.commands.setContent(version.content)
      setCurrentVersion(versionId)
      lastSavedContentRef.current = version.content
      setHasUnsavedChanges(false)

      eventBus.emit('version:restored', {
        fragmentId,
        versionId,
      })
    },
    [editor, versions, fragmentId, setCurrentVersion, setHasUnsavedChanges],
  )

  return {
    versions,
    currentVersion,
    hasUnsavedChanges,
    isSaving,
    saveVersion,
    discardChanges,
    restoreVersion,
    getNextVersionNumber,
  }
}
