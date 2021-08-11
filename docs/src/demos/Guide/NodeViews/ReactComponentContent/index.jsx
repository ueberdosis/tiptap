import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ReactComponent from './Extension.js'
import './styles.scss'

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ReactComponent,
    ],
    content: `
    <p>
      This is still the text editor you’re used to, but enriched with node views.
    </p>
    <react-component>
      <p>This is editable.</p>
    </react-component>
    <p>
      Did you see that? That’s a React component. We are really living in the future.
    </p>
    `,
  })

  return (
    <>
      {editor && (
        <div>
          <button
            className={[
              editor.isActive('reactComponent') && 'is-active'
            ].filter(Boolean).join(' ')}
            onClick={() => {
              editor.chain().focus().toggleReactComponent().run()
            }}
          >
            React Component
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
    </>
  )
}
