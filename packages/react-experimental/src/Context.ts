import type { Editor } from '@tiptap/core'
import { createContext, useContext } from 'react'

export type CurrentEditorContextValue = {
  editor: Editor | null
}

/**
 * The legacy-compatible current-editor context. `<Tiptap>` provides it so
 * components written against `@tiptap/react`'s `useCurrentEditor()` keep
 * working; outside a provider it resolves to `{ editor: null }`.
 */
export const CurrentEditorContext = createContext<CurrentEditorContextValue>({
  editor: null,
})

CurrentEditorContext.displayName = 'CurrentEditorContext'

/**
 * Reads the current editor from the nearest `<Tiptap>` provider. Returns
 * `{ editor: null }` when there is none — matching the legacy
 * `useCurrentEditor` contract.
 */
export const useCurrentEditor = () => useContext(CurrentEditorContext)
