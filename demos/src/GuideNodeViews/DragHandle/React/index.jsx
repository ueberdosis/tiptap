import './styles.scss'

import { EditorProvider } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

import DraggableItem from './DraggableItem.js'

const extensions = [
  StarterKit,
  DraggableItem,
]

const content = `
        <p>This is a boring paragraph.</p>
        <div data-type="draggable-item">
          <p>Followed by a fancy draggable item.</p>
        </div>
        <div data-type="draggable-item">
          <p>And another draggable item.</p>
          <div data-type="draggable-item">
            <p>And a nested one.</p>
            <div data-type="draggable-item">
              <p>But can we go deeper?</p>
            </div>
          </div>
        </div>
        <p>Let’s finish with a boring paragraph.</p>
      `

export default () => {
  return <EditorProvider extensions={extensions} content={content}></EditorProvider>
}
