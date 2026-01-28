import './styles.scss'

import { getHierarchicalIndexes, TableOfContents } from '@tiptap/extension-table-of-contents'
import { useEditor, Tiptap } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useState } from 'react'

import { content as bookContent } from '../content.js'
import { ToC } from './ToC.jsx'

const MemorizedToC = React.memo(ToC)

export default () => {
  const [items, setItems] = useState([])

  const editor = useEditor({
    extensions: [
      StarterKit,
      TableOfContents.configure({
        getIndex: getHierarchicalIndexes,
        onUpdate(content) {
          setItems(content)
        },
      }),
    ],
    content: bookContent,
  })

  if (!editor) {
    return null
  }

  return (
    <div className="col-group">
      <div className="main">
        <Tiptap instance={editor}>
          <Tiptap.Content />
        </Tiptap>
      </div>
      <div className="sidebar">
        <div className="sidebar-options">
          <div className="label-large">Table of contents</div>
          <div className="table-of-contents">
            <MemorizedToC editor={editor} items={items} />
          </div>
        </div>
      </div>
    </div>
  )
}
