import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import './styles.scss'

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

  if (!editor) {
    return null
  }

  return (
    <>
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={editor.isActive('taskList') ? 'is-active' : ''}
      >
        toggleTaskList
      </button>
      <button
        onClick={() => editor.chain().focus().splitListItem('taskItem').run()}
        disabled={!editor.can().splitListItem('taskItem')}
      >
        splitListItem
      </button>
      <button
        onClick={() => editor.chain().focus().sinkListItem('taskItem').run()}
        disabled={!editor.can().sinkListItem('taskItem')}
      >
        sinkListItem
      </button>
      <button
        onClick={() => editor.chain().focus().liftListItem('taskItem').run()}
        disabled={!editor.can().liftListItem('taskItem')}
      >
        liftListItem
      </button>

      <EditorContent editor={editor} />
    </>
  )
}
