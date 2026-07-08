import type { Editor } from '@tiptap/core'
import { useCallback, useLayoutEffect, useRef } from 'react'

/**
 * A stable callback with safe access to the editor. The returned function
 * keeps its identity across renders (safe to pass as a prop or dependency)
 * while always invoking the latest `fn` — no stale closures. When the editor
 * is missing or destroyed, calls are no-ops returning `undefined`.
 *
 * Use for event handlers that need the editor/view; do not call during
 * render.
 */
export const useEditorEventCallback = <Args extends unknown[], Result>(
  editor: Editor | null,
  fn: (editor: Editor, ...args: Args) => Result,
): ((...args: Args) => Result | undefined) => {
  const fnRef = useRef(fn)

  useLayoutEffect(() => {
    fnRef.current = fn
  })

  return useCallback(
    (...args: Args) => {
      // `extensionManager` is nulled by destroy(); `isDestroyed` cannot be
      // used here because it is also true while simply unmounted
      if (!editor || !editor.extensionManager) {
        return undefined
      }
      return fnRef.current(editor, ...args)
    },
    [editor],
  )
}
