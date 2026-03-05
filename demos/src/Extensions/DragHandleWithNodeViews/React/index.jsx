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
      <h1>
        Drag to reorder — watch the position update instantly
      </h1>
      <p>
        Drag any recommendation block below to a new position. The <code>pos:</code> value should update immediately.
      </p>
      <div class="node-recommendation" data-id="1"></div>
      <div class="node-recommendation" data-id="2"></div>
      <div class="node-recommendation" data-id="3"></div>
      <div class="node-recommendation" data-id="4"></div>
      <div class="node-recommendation" data-id="5"></div>
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
