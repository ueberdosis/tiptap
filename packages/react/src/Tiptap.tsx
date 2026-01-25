import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { EditorContext } from './Context.js'
import type { Editor, EditorContentProps, EditorStateSnapshot } from './index.js'
import { EditorContent, useEditorState } from './index.js'
import { type BubbleMenuProps, BubbleMenu } from './menus/BubbleMenu.js'
import { type FloatingMenuProps, FloatingMenu } from './menus/FloatingMenu.js'

/**
 * The shape of the React context used by the `<Tiptap />` components.
 *
 * This object exposes the editor instance and a simple readiness flag.
 */
export type TiptapContextType = {
  /** The Tiptap editor instance. May be null during SSR or before initialization. */
  editor: Editor | null

  /** True when the editor has finished initializing and is ready for user interaction. */
  isReady: boolean
}

/**
 * React context that stores the current editor instance and readiness flag.
 *
 * Use `useTiptap()` to read from this context in child components.
 */
export const TiptapContext = createContext<TiptapContextType>({
  editor: null,
  isReady: false,
})

TiptapContext.displayName = 'TiptapContext'

/**
 * Hook to read the Tiptap context (`editor` + `isReady`).
 *
 * This is a small convenience wrapper around `useContext(TiptapContext)`.
 *
 * @returns The current `TiptapContextType` value from the provider.
 *
 * @example
 * ```tsx
 * import { useTiptap } from '@tiptap/react'
 *
 * function Status() {
 *   const { isReady } = useTiptap()
 *   return <div>{isReady ? 'Editor ready' : 'Loading editor...'}</div>
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
 * Important: This hook should only be used when the editor is available.
 * Use the `isReady` flag from `useTiptap()` to guard against null editor,
 * or ensure your component only renders after the editor is initialized.
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
 *   const { isReady } = useTiptap()
 *
 *   // Only use useTiptapState when the editor is ready
 *   const wordCount = useTiptapState(state => {
 *     const text = state.editor.state.doc.textContent
 *     return text.split(/\s+/).filter(Boolean).length
 *   })
 *
 *   if (!isReady) return null
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
    editor: editor as Editor,
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
   * Can be null during SSR or before initialization.
   */
  instance: Editor | null
  children: ReactNode
}

/**
 * Top-level provider component that makes the editor instance available via
 * React context and tracks when the editor becomes ready.
 *
 * The component listens to the editor's `create` event and flips the
 * `isReady` flag once initialization completes.
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
 *     <Tiptap instance={editor}>
 *       <Toolbar />
 *       <Tiptap.Content />
 *     </Tiptap>
 *   )
 * }
 * ```
 */
export function TiptapWrapper({ instance, children }: TiptapWrapperProps) {
  const [isReady, setIsReady] = useState(instance?.isInitialized ?? false)

  useEffect(() => {
    if (!instance) {
      setIsReady(false)
      return
    }

    // If the editor is already initialized, set isReady to true
    if (instance.isInitialized) {
      setIsReady(true)
      return
    }

    const handleCreate = () => {
      setIsReady(true)
    }

    instance.on('create', handleCreate)

    return () => {
      instance.off('create', handleCreate)
    }
  }, [instance])

  // Memoize context values to prevent unnecessary re-renders
  const tiptapContextValue = useMemo<TiptapContextType>(() => ({ editor: instance, isReady }), [instance, isReady])

  // Provide backwards compatibility with the legacy EditorContext
  // so components using useCurrentEditor() work inside <Tiptap>
  const legacyContextValue = useMemo(() => ({ editor: instance }), [instance])

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

export type TiptapLoadingProps = {
  children: ReactNode
}

/**
 * Component that renders its children only when the editor is not ready.
 *
 * This is useful for displaying loading states or placeholders during
 * editor initialization, especially with SSR.
 *
 * @param props - The props for the TiptapLoading component.
 * @returns The children when editor is not ready, or null when ready.
 *
 * @example
 * ```tsx
 * <Tiptap instance={editor}>
 *   <Tiptap.Loading>
 *     <div className="skeleton">Loading editor...</div>
 *   </Tiptap.Loading>
 *   <Tiptap.Content />
 * </Tiptap>
 * ```
 */
export function TiptapLoading({ children }: TiptapLoadingProps) {
  const { isReady } = useTiptap()

  if (isReady) {
    return null
  }

  return children
}

TiptapLoading.displayName = 'Tiptap.Loading'

/**
 * A wrapper around the library `BubbleMenu` that injects the editor from
 * context so callers don't need to pass the `editor` prop.
 *
 * Returns `null` when the editor is not available (for example during SSR).
 *
 * @param props - Props for the underlying `BubbleMenu` (except `editor`).
 * @returns A `BubbleMenu` bound to the context editor, or `null`.
 *
 * @example
 * ```tsx
 * <Tiptap.BubbleMenu tippyOptions={{ duration: 100 }}>
 *   <button onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
 * </Tiptap.BubbleMenu>
 * ```
 */
export function TiptapBubbleMenu({ children, ...rest }: { children: ReactNode } & Omit<BubbleMenuProps, 'editor'>) {
  const { editor } = useTiptap()

  if (!editor) {
    return null
  }

  return (
    <BubbleMenu editor={editor} {...rest}>
      {children}
    </BubbleMenu>
  )
}

TiptapBubbleMenu.displayName = 'Tiptap.BubbleMenu'

/**
 * A wrapper around the library `FloatingMenu` that injects the editor from
 * context so callers don't need to pass the `editor` prop.
 *
 * Returns `null` when the editor is not available.
 *
 * @param props - Props for the underlying `FloatingMenu` (except `editor`).
 * @returns A `FloatingMenu` bound to the context editor, or `null`.
 *
 * @example
 * ```tsx
 * <Tiptap.FloatingMenu placement="top">
 *   <button onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
 * </Tiptap.FloatingMenu>
 * ```
 */
export function TiptapFloatingMenu({ children, ...rest }: { children: ReactNode } & Omit<FloatingMenuProps, 'editor'>) {
  const { editor } = useTiptap()

  if (!editor) {
    return null
  }

  return (
    <FloatingMenu {...rest} editor={editor}>
      {children}
    </FloatingMenu>
  )
}

TiptapFloatingMenu.displayName = 'Tiptap.FloatingMenu'

/**
 * Root `Tiptap` component. Use it as the provider for all child components.
 *
 * The exported object includes several helper subcomponents for common use
 * cases: `Content`, `Loading`, `BubbleMenu`, and `FloatingMenu`.
 *
 * This component provides both the new `TiptapContext` (accessed via `useTiptap()`)
 * and the legacy `EditorContext` (accessed via `useCurrentEditor()`) for
 * backwards compatibility.
 *
 * @example
 * ```tsx
 * const editor = useEditor({ extensions: [...] })
 *
 * return (
 *   <Tiptap instance={editor}>
 *     <Tiptap.Loading>Initializing editor...</Tiptap.Loading>
 *     <Tiptap.Content />
 *     <Tiptap.BubbleMenu>
 *       <button onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
 *     </Tiptap.BubbleMenu>
 *   </Tiptap>
 * )
 * ```
 */
export const Tiptap = Object.assign(TiptapWrapper, {
  /**
   * The Tiptap Content component that renders the EditorContent with the editor instance from the context.
   * @see TiptapContent
   */
  Content: TiptapContent,

  /**
   * The Tiptap Loading component that renders its children only when the editor is not ready.
   * @see TiptapLoading
   */
  Loading: TiptapLoading,

  /**
   * The Tiptap BubbleMenu component that wraps the BubbleMenu from Tiptap and provides the editor instance from the context.
   * @see TiptapBubbleMenu
   */
  BubbleMenu: TiptapBubbleMenu,

  /**
   * The Tiptap FloatingMenu component that wraps the FloatingMenu from Tiptap and provides the editor instance from the context.
   * @see TiptapFloatingMenu
   */
  FloatingMenu: TiptapFloatingMenu,
})

export default Tiptap
