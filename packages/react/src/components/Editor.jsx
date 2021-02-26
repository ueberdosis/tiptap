import React, {
  useState, useRef, useEffect, createContext, useContext,
} from 'react'
import { Editor as Tiptap } from '@tiptap/core'

export const EditorContext = createContext({})

export const useEditor = () => useContext(EditorContext)

export const Editor = ({
  value, onChange, children, ...props
}) => {
  const [editor, setEditor] = useState(null)
  const editorRef = useRef(null)

  useEffect(() => {
    const e = new Tiptap({
      element: editorRef.current,
      content: value,
      ...props,
    }).on('transaction', () => {
      onChange(e.getJSON())
    })

    setEditor(e)
  }, [])

  return (
    <EditorContext.Provider value={editor}>
      {editorRef.current && children}
      <div ref={editorRef} />
    </EditorContext.Provider>
  )
}
