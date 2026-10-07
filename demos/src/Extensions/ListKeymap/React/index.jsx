import './styles.scss'

import Document from '@tiptap/extension-document'
import { BulletList, ListItem, ListKeymap } from '@tiptap/extension-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, BulletList, ListItem, ListKeymap],
    content: `
        <ul>
          <li>A list item</li>
          <li>And another one</li>
        </ul>
      `,
  })

  const { isBulletList, canSplitListItem, canSinkListItem, canLiftListItem } = useEditorState({
    editor,
    selector: ctx => {
      if (!ctx.editor) {
        return {
          isBulletList: false,
          canSplitListItem: false,
          canSinkListItem: false,
          canLiftListItem: false,
        }
      }

      return {
        isBulletList: ctx.editor.isActive('bulletList') ?? false,
        canSplitListItem: ctx.editor.can().splitListItem('listItem') ?? false,
        canSinkListItem: ctx.editor.can().sinkListItem('listItem') ?? false,
        canLiftListItem: ctx.editor.can().liftListItem('listItem') ?? false,
      }
    },
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
            className={isBulletList ? 'is-active' : ''}
          >
            Toggle bullet list
          </button>
          <button
            onClick={() => editor.chain().focus().splitListItem('listItem').run()}
            disabled={!canSplitListItem}
          >
            Split list item
          </button>
          <button
            onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
            disabled={!canSinkListItem}
          >
            Sink list item
          </button>
          <button
            onClick={() => editor.chain().focus().liftListItem('listItem').run()}
            disabled={!canLiftListItem}
          >
            Lift list item
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
