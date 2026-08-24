import './styles.scss'

import { Document } from '@tiptap/editor/extensions/document'
import { BulletList, ListItem } from '@tiptap/editor/extensions/list'
import { Paragraph } from '@tiptap/editor/extensions/paragraph'
import { Text } from '@tiptap/editor/extensions/text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
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
  const editorState = useEditorState({
    editor,
    selector: ctx => ({
      isBulletList: ctx.editor.isActive('bulletList') ?? false,
      canSplitListItem: ctx.editor.can().splitListItem('listItem') ?? false,
      canSinkListItem: ctx.editor.can().sinkListItem('listItem') ?? false,
      canLiftListItem: ctx.editor.can().liftListItem('listItem') ?? false,
    }),
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
            className={editorState.isBulletList ? 'is-active' : ''}
          >
            Toggle bullet list
          </button>
          <button
            onClick={() => editor.chain().focus().splitListItem('listItem').run()}
            disabled={!editorState.canSplitListItem}
          >
            Split list item
          </button>
          <button
            onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
            disabled={!editorState.canSinkListItem}
          >
            Sink list item
          </button>
          <button
            onClick={() => editor.chain().focus().liftListItem('listItem').run()}
            disabled={!editorState.canLiftListItem}
          >
            Lift list item
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
