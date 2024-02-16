import { EditorOptions } from '@tiptap/core'
import React, { createContext, ReactNode, useContext } from 'react'

import { Editor } from './Editor.js'
import { EditorContent } from './EditorContent.js'
import { useEditor, useEditorForImmediateRender } from './useEditor.js'

export type EditorContextValue = {
  editor: Editor | null;
}

export const EditorContext = createContext<EditorContextValue>({
  editor: null,
})

export const EditorConsumer = EditorContext.Consumer

export const useCurrentEditor = () => useContext(EditorContext)

export type EditorProviderProps = {
  children: ReactNode;
  /**
   * This option will create and immediately return a defined editor instance. The editor returned in the context consumer will never be null if
   * this is enabled. In future major versions, this property will be removed and this behavior will be the defualt.
   */
  useImmediateRender?: boolean;
  slotBefore?: ReactNode;
  slotAfter?: ReactNode;
} & Partial<EditorOptions>

const EditorProviderNoImmediateRender = ({
  children, slotAfter, slotBefore, ...editorOptions
}: Omit<EditorProviderProps, 'useImmediateRender'>) => {
  const editor = useEditor(editorOptions)

  return (
    <EditorContext.Provider value={{ editor }}>
      {slotBefore}
      <EditorConsumer>
        {({ editor: currentEditor }) => (
          <EditorContent editor={currentEditor} />
        )}
      </EditorConsumer>
      {children}
      {slotAfter}
    </EditorContext.Provider>
  )
}

const EditorProviderImmediateRender = ({
  children, slotAfter, slotBefore, ...editorOptions
}: Omit<EditorProviderProps, 'useImmediateRender'>) => {
  const editor = useEditorForImmediateRender(editorOptions)

  return (
    <EditorContext.Provider value={{ editor }}>
      {slotBefore}
      <EditorConsumer>
        {({ editor: currentEditor }) => (
          <EditorContent editor={currentEditor} />
        )}
      </EditorConsumer>
      {children}
      {slotAfter}
    </EditorContext.Provider>
  )
}

export const EditorProvider = ({ useImmediateRender, ...providerOptions }: EditorProviderProps) => {
  if (useImmediateRender) {
    return (
      <EditorProviderImmediateRender {...providerOptions} />
    )
  }

  return (
    <EditorProviderNoImmediateRender {...providerOptions} />
  )
}
