import './styles.scss'

import DragHandle from '@tiptap/extension-drag-handle-react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

import { Recommendation } from './extensions/recommendation/index.jsx'

export default () => {
  const editor = useEditor({
    extensions: [StarterKit, Recommendation],
    content: `
      <div class="node-recommendation" data-id="1"></div>
      <h1>
        This is a very unique heading.
      </h1>
      <p>
        This is a unique paragraph. It’s so unique, it even has an ID attached to it.
      </p>
      <div class="node-recommendation" data-id="2"></div>
      <p>
        And this one, too.
      </p>
    `,
  })

  return (
    <>
      <DragHandle editor={editor}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
        </svg>
      </DragHandle>
      <EditorContent editor={editor} />
    </>
  )
}
