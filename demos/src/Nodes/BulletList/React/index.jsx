import './styles.scss'

import Document from '@dibdab/extension-document'
import { BulletList, ListItem } from '@dibdab/extension-list'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { EditorContent, useEditor } from '@dibdab/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, BulletList, ListItem],
    content: `
        <ul>
          <li>A list item</li>
          <li>And another one</li>
        </ul>
      `,
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
          >
            Toggle bullet list
          </button>
          <button
            onClick={() => editor.chain().focus().splitListItem('listItem').run()}
            disabled={!editor.can().splitListItem('listItem')}
          >
            Split list item
          </button>
          <button
            onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
            disabled={!editor.can().sinkListItem('listItem')}
          >
            Sink list item
          </button>
          <button
            onClick={() => editor.chain().focus().liftListItem('listItem').run()}
            disabled={!editor.can().liftListItem('listItem')}
          >
            Lift list item
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
