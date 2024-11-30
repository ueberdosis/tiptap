import { Editor } from '@tiptap/core'
import React, {
  createContext, HTMLAttributes, ReactNode, useContext,
} from 'react'

import { EditorContent } from './EditorContent.js'
import { useEditor, UseEditorOptions } from './useEditor.js'

export type EditorContextValue = {
  editor: Editor | null;
}

export const EditorContext = createContext<EditorContextValue>({
  editor: null,
})

export const EditorConsumer = EditorContext.Consumer

/**
 * A hook to get the current editor instance.
 */
export const useCurrentEditor = () => useContext(EditorContext)

export type EditorProviderProps = {
  children?: ReactNode;
  slotBefore?: ReactNode;
  slotAfter?: ReactNode;
  editorContainerProps?: HTMLAttributes<HTMLDivElement>;
} & UseEditorOptions

/**
 * This is the provider component for the editor.
 * It allows the editor to be accessible across the entire component tree
 * with `useCurrentEditor`.
 */
export function EditorProvider({
  children, slotAfter, slotBefore, editorContainerProps = {}, ...editorOptions
}: EditorProviderProps) {
  const editor = useEditor(editorOptions)

  if (!editor) {
    return null
  }

  return (
    <EditorContext.Provider value={{ editor }}>
      {slotBefore}
      <EditorConsumer>
        {({ editor: currentEditor }) => (
          <EditorContent editor={currentEditor} {...editorContainerProps} />
        )}
      </EditorConsumer>
      {children}
      {slotAfter}
    </EditorContext.Provider>
  )
}
