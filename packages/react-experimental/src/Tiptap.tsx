/** @jsxImportSource react */
import type { Editor } from '@tiptap/core'
import type { ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'

import type { EditorContentProps } from './components/EditorContent.js'
import { EditorContent } from './components/EditorContent.js'
import { CurrentEditorContext } from './Context.js'
import type { EditorStateSnapshot } from './useEditorState.js'
import { useEditorState } from './useEditorState.js'

/**
 * The shape of the React context used by the `<Tiptap />` components.
 */
export type TiptapContextType = {
  /** The Tiptap editor instance. */
  editor: Editor
}

/**
 * React context that stores the current editor instance.
 *
 * Use `useTiptap()` to read from this context in child components.
 */
export const TiptapContext = createContext<TiptapContextType>({
  get editor(): Editor {
    throw new Error('useTiptap must be used within a <Tiptap> provider')
  },
})

TiptapContext.displayName = 'TiptapContext'

/**
 * Hook to read the Tiptap context and access the editor instance.
 * The editor is always available when used within a `<Tiptap>` provider;
 * outside one it throws.
 *
 * @example
 * ```tsx
 * function Toolbar() {
 *   const { editor } = useTiptap()
 *
 *   return (
 *     <button onClick={() => editor.chain().focus().toggleBold().run()}>
 *       Bold
 *     </button>
 *   )
 * }
 * ```
 */
export const useTiptap = () => useContext(TiptapContext)

/**
 * Select a slice of the editor state using the context-provided editor — a
 * thin wrapper around `useEditorState` that reads the editor from
 * `useTiptap()` so callers don't have to pass it manually.
 *
 * @example
 * ```tsx
 * function WordCount() {
 *   const wordCount = useTiptapState(state => {
 *     const text = state.editor.state.doc.textContent
 *     return text.split(/\s+/).filter(Boolean).length
 *   })
 *
 *   return <span>{wordCount} words</span>
 * }
 * ```
 */
export function useTiptapState<TSelectorResult>(
  selector: (context: EditorStateSnapshot<Editor>) => TSelectorResult,
  equalityFn?: (a: TSelectorResult, b: TSelectorResult | null) => boolean,
) {
  const { editor } = useTiptap()

  return useEditorState({
    editor,
    selector,
    equalityFn,
  })
}

export type TiptapWrapperEditorInstanceProps =
  | {
      /**
       * The editor instance to provide to child components.
       * Use `useEditor()` to create this instance.
       */
      editor: Editor
    }
  | {
      /**
       * @deprecated Use `editor` instead. Will be removed in the next major version.
       */
      instance: Editor
    }

/**
 * Props for the `Tiptap` root/provider component.
 */
export type TiptapWrapperProps = TiptapWrapperEditorInstanceProps & {
  children: ReactNode
}

/**
 * Top-level provider component that makes the editor instance available via
 * React context to all child components. Also provides the legacy
 * current-editor context, so components using `useCurrentEditor()` work
 * inside a `<Tiptap>` provider.
 *
 * @example
 * ```tsx
 * function App() {
 *   const editor = useEditor({ extensions: [...] })
 *
 *   return (
 *     <Tiptap editor={editor}>
 *       <Toolbar />
 *       <Tiptap.Content />
 *     </Tiptap>
 *   )
 * }
 * ```
 */
export function TiptapWrapper({ children, ...props }: TiptapWrapperProps) {
  const resolvedEditor = 'editor' in props ? props.editor : props.instance

  if (!resolvedEditor) {
    throw new Error('Tiptap: An editor instance is required. Pass a non-null `editor` prop.')
  }

  const tiptapContextValue = useMemo<TiptapContextType>(
    () => ({ editor: resolvedEditor }),
    [resolvedEditor],
  )

  // Backwards compatibility for components using useCurrentEditor()
  const legacyContextValue = useMemo(() => ({ editor: resolvedEditor }), [resolvedEditor])

  return (
    <CurrentEditorContext.Provider value={legacyContextValue}>
      <TiptapContext.Provider value={tiptapContextValue}>{children}</TiptapContext.Provider>
    </CurrentEditorContext.Provider>
  )
}

TiptapWrapper.displayName = 'Tiptap'

/**
 * Convenience component that renders `EditorContent` using the
 * context-provided editor instance, instead of manually passing the
 * `editor` prop.
 *
 * @example
 * ```tsx
 * // inside a Tiptap provider
 * <Tiptap.Content className="editor" />
 * ```
 */
export function TiptapContent({ ...rest }: Omit<EditorContentProps, 'editor' | 'ref'>) {
  const { editor } = useTiptap()

  return <EditorContent editor={editor} {...rest} />
}

TiptapContent.displayName = 'Tiptap.Content'

/**
 * Root `Tiptap` component. Use it as the provider for all child components;
 * the exported object includes the `Content` subcomponent for rendering the
 * editor content area.
 *
 * @example
 * ```tsx
 * function App() {
 *   const editor = useEditor({ extensions: [...] })
 *
 *   return (
 *     <Tiptap editor={editor}>
 *       <Tiptap.Content />
 *     </Tiptap>
 *   )
 * }
 * ```
 */
export const Tiptap = Object.assign(TiptapWrapper, {
  /**
   * Renders the EditorContent with the editor instance from the context.
   * @see TiptapContent
   */
  Content: TiptapContent,
})
