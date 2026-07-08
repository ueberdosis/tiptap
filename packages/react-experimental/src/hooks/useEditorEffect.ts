import type { Editor } from '@tiptap/core'
import { useLayoutEffect, useRef } from 'react'

import { ReactEditorView } from '../ReactEditorView.js'
import { registerEditorEffect } from './editorEffects.js'

type EditorEffect = (editor: Editor) => void | (() => void)

/**
 * A layout effect that runs after the editor's view has been updated with
 * the latest state — i.e. after `EditorContent`'s commit effect applied the
 * staged props and synced the DOM selection. Safe for reading view geometry
 * (`coordsAtPos`, `posAtDOM`, …), which plain `useLayoutEffect` is not: a
 * sibling's or descendant's layout effect can run before the view committed.
 *
 * Works from anywhere (menus outside `EditorContent`, node views inside);
 * the effect may return a cleanup, run before the next invocation and on
 * unregister. The latest effect callback is always used — no stale closures.
 */
export const useEditorEffect = (editor: Editor | null, effect: EditorEffect): void => {
  const effectRef = useRef(effect)

  useLayoutEffect(() => {
    effectRef.current = effect
  })

  useLayoutEffect(() => {
    if (!editor) {
      return undefined
    }

    let cleanup: (() => void) | void

    const run = (current: Editor) => {
      cleanup?.()
      cleanup = effectRef.current(current)
    }

    const unregister = registerEditorEffect(editor, run)

    // A consumer mounting after the editor is already committed should not
    // wait for the next transaction
    if (editor.view instanceof ReactEditorView) {
      run(editor)
    }

    return () => {
      unregister()
      cleanup?.()
    }
  }, [editor])
}
