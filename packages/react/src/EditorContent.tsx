import React, { HTMLProps, memo, useLayoutEffect, useRef } from 'react'
import { EditorOptions } from '@tiptap/core'
import { Editor } from './Editor'
import { useSetEditor } from './useEditor'
import { useSetRenderers, Portals } from './useRenderers'

export interface EditorContentProps extends HTMLProps<HTMLDivElement> {
  editorOptions: Partial<EditorOptions>
}

export interface EditorContentState {
  editor?: Editor
}

export const EditorContent: React.FC<EditorContentProps> = memo((props) => {

  const editorContentRef = useRef<HTMLDivElement>(null)

  const setEditor = useSetEditor()
  const setRenderers = useSetRenderers()

  useLayoutEffect(
    () => {
      // Initialize editor and mount onto editorContentRef.
      const editor = new Editor(props.editorOptions)
      editor.setRenderers = setRenderers

      const element = editorContentRef.current!
      element.append(editor.options.element)
  
      editor.options.element = element
      editor.createNodeViews()
  
      // Update context when editor initializes and updates.
      setEditor(editor)
      editor.on('transaction', () => setEditor(editor))

      // Cleanup editor on component unmount.
      return () => {
        editor.destroy()
        editor.setRenderers = undefined
      }
    },
    [props.editorOptions]
  )

  const { editorOptions, ...rest } = props
  return (
    <>
      <div ref={editorContentRef} {...rest}/>
      <Portals/>
    </>
  )
})