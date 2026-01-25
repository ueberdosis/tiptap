import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState } from 'react'

function EditorComponent({ label }: { label?: string }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World!</p>',
    editorProps: {
      attributes: {
        style: 'padding: 8px',
      },
    },
  })

  return (
    <div style={{ border: '2px solid #f3f3f3', margin: 24 }}>
      <div style={{ padding: 4, fontSize: 14, backgroundColor: '#f3f3f3' }}>{label}</div>
      <EditorContent editor={editor} />
    </div>
  )
}

export default function MultipleEditors() {
  const [editorA, setEditorA] = useState(false)
  const [editorB, setEditorB] = useState(false)

  const toolbar = (
    <div>
      <button onClick={() => setEditorA(prev => !prev)}>{editorA ? 'Destroy' : 'Create'} Editor A</button>
      <button onClick={() => setEditorB(prev => !prev)}>{editorB ? 'Destroy' : 'Create'} Editor B</button>
    </div>
  )

  return (
    <div>
      {toolbar}
      <div>
        {editorA && <EditorComponent label="Editor A" />}
        {editorB && <EditorComponent label="Editor B" />}
      </div>
    </div>
  )
}
