/**
 * React adapter for `@tiptap/editor`.
 *
 * Exposes React-specific APIs alongside the defaults-enabled `Editor` and
 * `useEditor` so applications can do everything from a single subpath:
 *
 *   import { Editor, useEditor, EditorContent } from '@tiptap/editor/react'
 *
 * The root `@tiptap/editor` entrypoint MUST NOT import this file — React
 * stays an optional peer dependency.
 */

import type { Editor as CoreEditor } from '@tiptap/core'
import { type UseEditorOptions, useEditor as coreUseEditor } from '@tiptap/react'
import type { DependencyList } from 'react'

import { withDefaultCoreNodes } from '../editor.js'

// Re-export everything the React package offers except the bits we override
// below. The defaults-enabled `Editor` shadows the core re-export from
// `@tiptap/react`, and our `useEditor` injects Document/Paragraph/Text into
// the options before delegating to the underlying hook.
export { Editor } from '../editor.js'
export type { UseEditorOptions } from '@tiptap/react'
export {
  EditorContent,
  EditorContext,
  EditorProvider,
  NodeViewContent,
  NodeViewWrapper,
  PureEditorContent,
  ReactMarkViewRenderer,
  ReactNodeViewRenderer,
  ReactRenderer,
  useCurrentEditor,
  useEditorState,
} from '@tiptap/react'

/**
 * Drop-in replacement for `@tiptap/react`'s `useEditor` that automatically
 * registers Document, Paragraph, and Text. Pass a same-named node in
 * `extensions` to override any default.
 *
 * @param options Editor options. `extensions` is augmented with the core
 *   defaults before being handed to the underlying hook.
 * @param deps Dependency list that, when changed, recreates the editor.
 * @returns The editor instance, or `null` during SSR / before mount.
 * @example
 * ```tsx
 * const editor = useEditor({
 *   extensions: [StarterKit],
 *   content: '<p>Hello world</p>',
 * })
 * ```
 */
export function useEditor(
  options: UseEditorOptions & { immediatelyRender: false },
  deps?: DependencyList,
): CoreEditor | null
export function useEditor(options: UseEditorOptions, deps?: DependencyList): CoreEditor
export function useEditor(options: UseEditorOptions = {}, deps: DependencyList = []): CoreEditor | null {
  return coreUseEditor(
    {
      ...options,
      extensions: withDefaultCoreNodes(options.extensions),
    },
    deps,
  )
}
