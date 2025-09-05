import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

import type { Editor, EditorContentProps, EditorStateSnapshot } from './index.js'
import { EditorContent, useEditorState } from './index.js'
import { type BubbleMenuProps, BubbleMenu } from './menus/BubbleMenu.js'
import { type FloatingMenuProps, FloatingMenu } from './menus/FloatingMenu.js'

export type TiptapContextType = {
  editor: Editor
  isReady: boolean
}

export const TiptapContext = createContext<TiptapContextType>({
  editor: null as unknown as Editor, // dummy editor instance
  isReady: false,
})

export const useTiptap = () => useContext(TiptapContext)

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

export type TiptapWrapperProps = {
  instance: Editor
  children: ReactNode
}

export function TiptapWrapper({ instance, children }: TiptapWrapperProps) {
  const [isReady, setIsReady] = useState(instance.isInitialized)

  useEffect(() => {
    const handleCreate = () => {
      setIsReady(true)
    }
    instance.on('create', handleCreate)

    return () => {
      instance.off('create', handleCreate)
    }
  }, [instance])

  return <TiptapContext.Provider value={{ editor: instance, isReady }}>{children}</TiptapContext.Provider>
}

export function TiptapContent({ ...rest }: Omit<EditorContentProps, 'editor' | 'ref'>) {
  const { editor } = useTiptap()

  return <EditorContent editor={editor} {...rest} />
}

export type TiptapLoadingProps = {
  children: ReactNode
}

export function TiptapLoading({ children }: TiptapLoadingProps) {
  const { isReady } = useTiptap()

  if (isReady) {
    return null
  }

  return children
}

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

export const Tiptap = Object.assign(TiptapWrapper, {
  Content: TiptapContent,
  Loading: TiptapLoading,
  BubbleMenu: TiptapBubbleMenu,
  FloatingMenu: TiptapFloatingMenu,
})

export default Tiptap
