import './styles.scss'

import Document from '@tiptap/extension-document'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: `
        <ul data-type="taskList">
          <li data-type="taskItem" data-checked="true">A list item</li>
          <li data-type="taskItem" data-checked="false">And another one</li>
        </ul>
      `,
  })
  const editorState = useEditorState({
    editor,
    selector: ctx => ({
      isTaskList: ctx.editor.isActive('taskList') ?? false,
      canSplitListItem: ctx.editor.can().splitListItem('taskItem') ?? false,
      canSinkListItem: ctx.editor.can().sinkListItem('taskItem') ?? false,
      canLiftListItem: ctx.editor.can().liftListItem('taskItem') ?? false,
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
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={editorState.isTaskList ? 'is-active' : ''}
          >
            Toggle task list
          </button>
          <button
            onClick={() => editor.chain().focus().splitListItem('taskItem').run()}
            disabled={!editorState.canSplitListItem}
          >
            Split list item
          </button>
          <button
            onClick={() => editor.chain().focus().sinkListItem('taskItem').run()}
            disabled={!editorState.canSinkListItem}
          >
            Sink list item
          </button>
          <button
            onClick={() => editor.chain().focus().liftListItem('taskItem').run()}
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
