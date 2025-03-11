/* eslint-disable @typescript-eslint/no-use-before-define */
import type { Editor } from '@tiptap/core'
import { type Accessor, type Component, type JSX, createContext, Show, splitProps, useContext } from 'solid-js'

import type { CreateEditorOptions } from './createEditor.js'
import { createEditor } from './createEditor.js'
import { EditorContent } from './EditorContent.js'

export type EditorContextValue = Accessor<Editor | undefined>

export const EditorContext = createContext<EditorContextValue>(() => undefined)

export const EditorConsumer: Component<{ children: (context: EditorContextValue) => JSX.Element }> = props => {
  const context = useCurrentEditor()
  return props.children(context)
}

/**
 * A hook to get the current editor instance.
 */
export const useCurrentEditor = () => {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useCurrentEditor was called outside of a <EditorContext>!')
  }
  return context
}

export type EditorProviderProps = {
  children?: JSX.Element
  slotBefore?: JSX.Element
  slotAfter?: JSX.Element
  editorContainerProps?: JSX.HTMLAttributes<HTMLDivElement>
} & CreateEditorOptions

/**
 * This is the provider component for the editor.
 * It allows the editor to be accessible across the entire component tree
 * with `useCurrentEditor`.
 */
export function EditorProvider(props: EditorProviderProps) {
  const [, editorOptions] = splitProps(props, ['children', 'slotAfter', 'slotBefore', 'editorContainerProps'])
  const editor = createEditor(editorOptions)
  return (
    <Show when={editor()}>
      <EditorContext.Provider value={editor}>
        {props.slotBefore}
        <EditorContent editor={editor()} {...props.editorContainerProps} />
        {props.children}
        {props.slotAfter}
      </EditorContext.Provider>
    </Show>
  )
}
