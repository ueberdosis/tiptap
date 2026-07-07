import type { EditorInternalOptions, EditorOptions } from '@tiptap/core'
import { Editor } from '@tiptap/core'
import { useEffect, useState } from 'react'

import { ReactRendererExtension } from '../extension.js'
import type { ReactEditorViewPlace } from '../ReactEditorView.js'
import { ReactEditorView } from '../ReactEditorView.js'

export type UseReactEditorOptions = Partial<Omit<EditorOptions, 'element'>>

/**
 * Creates a Tiptap editor wired to the React renderer: the editor is
 * constructed unmounted (`element: null`) and `EditorContent` mounts it onto
 * the React-rendered document element, where the internal view factory
 * substitutes a `ReactEditorView`.
 *
 * The instance is created once per component lifetime and destroyed on
 * unmount. (StrictMode hardening and dependency-driven recreation follow in
 * a later phase.)
 */
export const useReactEditor = (options: UseReactEditorOptions = {}): Editor => {
  const [editor] = useState(() => {
    const editorOptions: Partial<EditorOptions> & EditorInternalOptions = {
      ...options,
      element: null,
      extensions: [...(options.extensions ?? []), ReactRendererExtension],
      // EditorContent always mounts on the rendered document element;
      // ReactEditorView itself rejects function placements at runtime
      __internalViewFactory: (element, props) =>
        new ReactEditorView(element as ReactEditorViewPlace, props),
    }

    return new Editor(editorOptions)
  })

  useEffect(() => () => editor.destroy(), [editor])

  return editor
}
