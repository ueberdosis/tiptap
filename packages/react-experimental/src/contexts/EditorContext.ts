import type { Editor } from '@tiptap/core'
import { createContext, useContext } from 'react'

import type { MarkViewComponent } from '../components/MarkViewComponentProps.js'
import type { NodeViewComponent } from '../components/NodeViewComponentProps.js'

export interface EditorContextValue {
  /** The editor rendered by the surrounding `EditorContent`, if any. */
  editor: Editor | null
  /** React node view components by node type name. */
  nodeViews: Record<string, NodeViewComponent>
  /** React mark view components by mark type name. */
  markViews: Record<string, MarkViewComponent>
}

const EMPTY: EditorContextValue = { editor: null, nodeViews: {}, markViews: {} }

/**
 * Carries the editor and the registered React node/mark view components down
 * the rendered document tree. Provided by `EditorContent`.
 */
export const EditorContext = createContext<EditorContextValue>(EMPTY)

/** The surrounding `EditorContent`'s editor and view component registries. */
export const useEditorContext = (): EditorContextValue => useContext(EditorContext)
