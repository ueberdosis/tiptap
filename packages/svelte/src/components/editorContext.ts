import { getContext, setContext } from 'svelte'

import type { Editor } from '../Editor.js'

const EDITOR_CTX = Symbol('editor')

/**
 * Read the editor provided by the closest `<Tiptap>` ancestor.
 *
 * Call this inside `$derived` to follow a replaced editor instance.
 *
 * @returns The current editor
 * @example
 * ```svelte
 * <script lang="ts">
 *   const editor = $derived(getEditor())
 * </script>
 * ```
 */
export const getEditor = (): Editor => {
  const getter = getContext<() => Editor>(EDITOR_CTX)

  if (!getter) {
    throw new Error('No editor found in context. Did you wrap your component in <Tiptap>?')
  }

  return getter()
}

// Context is only set once, so we store a getter to let consumers read the
// current editor after the prop changes.
export const setEditor = (getEditorInstance: () => Editor): void => {
  setContext(EDITOR_CTX, getEditorInstance)
}
