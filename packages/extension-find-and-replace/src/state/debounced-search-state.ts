import type { Editor } from '@tiptap/core'

/**
 * The pending debounced search for one editor.
 */
export interface DebouncedSearchState {
  timeout: ReturnType<typeof setTimeout> | null
  pendingTerm: string | null
}

const debouncedSearchState = new WeakMap<Editor, DebouncedSearchState>()

/**
 * Get the pending debounced search for an editor, creating it on first use.
 */
export function getDebouncedSearchState(editor: Editor): DebouncedSearchState {
  const existingState = debouncedSearchState.get(editor)

  if (existingState) {
    return existingState
  }

  const nextState: DebouncedSearchState = {
    timeout: null,
    pendingTerm: null,
  }

  debouncedSearchState.set(editor, nextState)

  return nextState
}

/**
 * Cancel the pending debounced search and drop it.
 */
export function clearDebouncedSearchState(editor: Editor): void {
  const state = debouncedSearchState.get(editor)

  if (!state) {
    return
  }

  if (state.timeout !== null) {
    clearTimeout(state.timeout)
  }

  debouncedSearchState.delete(editor)
}
