import './styles.scss'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useState } from 'react'

import ReactComponent from './Extension.js'

export default () => {
  const [mounted, setMounted] = useState(true)
  const editor = useEditor({
    extensions: [StarterKit, ReactComponent],
    content: `
    <p>
      This is still the text editor you’re used to, but enriched with node views.
    </p>
    <react-component>This is editable. You can create a new component by pressing Mod+Enter.</react-component>
    <p>
      Did you see that? That’s a React component. We are really living in the future.
    </p>
    `,
  })

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button onClick={() => setMounted(value => !value)}>
            {mounted ? 'Unmount editor' : 'Mount editor'}
          </button>
        </div>
      </div>
      {mounted && <EditorContent editor={editor} />}
    </>
  )
}
