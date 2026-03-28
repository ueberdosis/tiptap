import type { ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'

import { EditorContext } from './Context.js'
import type { Editor, EditorContentProps, EditorStateSnapshot } from './index.js'
import { EditorContent, useEditorState } from './index.js'

/**
 * The shape of the React context used by the `<Tiptap />` components.
 *
 * The editor instance is always available when using the default `useEditor`
 * configuration. For SSR scenarios where `immediatelyRender: false` is used,
 * consider using the legacy `EditorProvider` pattern instead.
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
 *
 * This is a small convenience wrapper around `useContext(TiptapContext)`.
 * The editor is always available when used within a `<Tiptap>` provider.
 *
 * @returns The current `TiptapContextType` value from the provider.
 *
 * @example
 * ```tsx
 * import { useTiptap } from '@tiptap/react'
 *
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
 * Select a slice of the editor state using the context-provided editor.
 *
 * This is a thin wrapper around `useEditorState` that reads the `editor`
 * instance from `useTiptap()` so callers don't have to pass it manually.
 *
 * @typeParam TSelectorResult - The type returned by the selector.
 * @param selector - Function that receives the editor state snapshot and
 *                   returns the piece of state you want to subscribe to.
 * @param equalityFn - Optional function to compare previous/next selected
 *                     values and avoid unnecessary updates.
 * @returns The selected slice of the editor state.
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

/**
 * Props for the `Tiptap` root/provider component.
 */
export type TiptapWrapperProps = {
  /**
   * The editor instance to provide to child components.
   * Use `useEditor()` to create this instance.
   */
  editor?: Editor

  /**
   * @deprecated Use `editor` instead. Will be removed in the next major version.
   */
  instance?: Editor

  children: ReactNode
}

/**
 * Top-level provider component that makes the editor instance available via
 * React context to all child components.
 *
 * This component also provides backwards compatibility with the legacy
 * `EditorContext`, so components using `useCurrentEditor()` will work
 * inside a `<Tiptap>` provider.
 *
 * @param props - Component props.
 * @returns A context provider element wrapping `children`.
 *
 * @example
 * ```tsx
 * import { Tiptap, useEditor } from '@tiptap/react'
 *
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
export function TiptapWrapper({ editor, instance, children }: TiptapWrapperProps) {
  const resolvedEditor = editor ?? instance

  if (!resolvedEditor) {
    throw new Error('Tiptap: An editor instance is required. Pass a non-null `editor` prop.')
  }

  const tiptapContextValue = useMemo<TiptapContextType>(() => ({ editor: resolvedEditor }), [resolvedEditor])

  // Provide backwards compatibility with the legacy EditorContext
  // so components using useCurrentEditor() work inside <Tiptap>
  const legacyContextValue = useMemo(() => ({ editor: resolvedEditor }), [resolvedEditor])

  return (
    <EditorContext.Provider value={legacyContextValue}>
      <TiptapContext.Provider value={tiptapContextValue}>{children}</TiptapContext.Provider>
    </EditorContext.Provider>
  )
}

TiptapWrapper.displayName = 'Tiptap'

/**
 * Convenience component that renders `EditorContent` using the context-provided
 * editor instance. Use this instead of manually passing the `editor` prop.
 *
 * @param props - All `EditorContent` props except `editor` and `ref`.
 * @returns An `EditorContent` element bound to the context editor.
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
 * Root `Tiptap` component. Use it as the provider for all child components.
 *
 * The exported object includes the `Content` subcomponent for rendering the
 * editor content area.
 *
 * This component provides both the new `TiptapContext` (accessed via `useTiptap()`)
 * and the legacy `EditorContext` (accessed via `useCurrentEditor()`) for
 * backwards compatibility.
 *
 * For bubble menus and floating menus, import them separately from
 * `@tiptap/react/menus` to keep floating-ui as an optional dependency.
 *
 * @example
 * ```tsx
 * import { Tiptap, useEditor } from '@tiptap/react'
 * import { BubbleMenu } from '@tiptap/react/menus'
 *
 * function App() {
 *   const editor = useEditor({ extensions: [...] })
 *
 *   return (
 *     <Tiptap editor={editor}>
 *       <Tiptap.Content />
 *       <BubbleMenu>
 *         <button onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
 *       </BubbleMenu>
 *     </Tiptap>
 *   )
 * }
 * ```
 */
export const Tiptap = Object.assign(TiptapWrapper, {
  /**
   * The Tiptap Content component that renders the EditorContent with the editor instance from the context.
   * @see TiptapContent
   */
  Content: TiptapContent,
})

export default Tiptap
