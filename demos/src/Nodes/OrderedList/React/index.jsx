import './styles.scss'

import Document from '@tiptap/extension-document'
import { ListItem, OrderedList } from '@tiptap/extension-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, OrderedList, ListItem],
    content: `
        <ol>
          <li>A list item</li>
          <li>And another one</li>
        </ol>

        <ol start="5">
          <li>This item starts at 5</li>
          <li>And another one</li>
        </ol>

        <ol type="a">
          <li>Lowercase alphabetical list</li>
          <li>Second item</li>
        </ol>

        <ol type="I">
          <li>Uppercase roman numerals</li>
          <li>Second item</li>
        </ol>
      `,
  })
  const editorState = useEditorState({
    editor,
    selector: ctx => ({
      isOrderedList: ctx.editor.isActive('orderedList') ?? false,
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
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editorState.isOrderedList ? 'is-active' : ''}
          >
            Toggle ordered list
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
