import './MenuBar.scss'

import { useEditorState } from '@tiptap/react'
import React, { Fragment } from 'react'

import MenuItem from './MenuItem.jsx'

export default ({ editor }) => {
  const editorState = useEditorState({
    editor,
    selector: ctx => ({
      isBold: ctx.editor.isActive('bold') ?? false,
      isItalic: ctx.editor.isActive('italic') ?? false,
      isStrike: ctx.editor.isActive('strike') ?? false,
      isCode: ctx.editor.isActive('code') ?? false,
      isHighlight: ctx.editor.isActive('highlight') ?? false,
      isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
      isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
      isParagraph: ctx.editor.isActive('paragraph') ?? false,
      isBulletList: ctx.editor.isActive('bulletList') ?? false,
      isOrderedList: ctx.editor.isActive('orderedList') ?? false,
      isTaskList: ctx.editor.isActive('taskList') ?? false,
      isCodeBlock: ctx.editor.isActive('codeBlock') ?? false,
      isBlockquote: ctx.editor.isActive('blockquote') ?? false,
    }),
  })

  const items = [
    {
      icon: 'bold',
      title: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editorState.isBold,
    },
    {
      icon: 'italic',
      title: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editorState.isItalic,
    },
    {
      icon: 'strikethrough',
      title: 'Strike',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editorState.isStrike,
    },
    {
      icon: 'code-view',
      title: 'Code',
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editorState.isCode,
    },
    {
      icon: 'mark-pen-line',
      title: 'Highlight',
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: () => editorState.isHighlight,
    },
    {
      type: 'divider',
    },
    {
      icon: 'h-1',
      title: 'Heading 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editorState.isHeading1,
    },
    {
      icon: 'h-2',
      title: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editorState.isHeading2,
    },
    {
      icon: 'paragraph',
      title: 'Paragraph',
      action: () => editor.chain().focus().setParagraph().run(),
      isActive: () => editorState.isParagraph,
    },
    {
      icon: 'list-unordered',
      title: 'Bullet list',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editorState.isBulletList,
    },
    {
      icon: 'list-ordered',
      title: 'Ordered list',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editorState.isOrderedList,
    },
    {
      icon: 'list-check-2',
      title: 'Task list',
      action: () => editor.chain().focus().toggleTaskList().run(),
      isActive: () => editorState.isTaskList,
    },
    {
      icon: 'code-box-line',
      title: 'Code block',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editorState.isCodeBlock,
    },
    {
      type: 'divider',
    },
    {
      icon: 'double-quotes-l',
      title: 'Blockquote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editorState.isBlockquote,
    },
    {
      icon: 'separator',
      title: 'Horizontal rule',
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      type: 'divider',
    },
    {
      icon: 'text-wrap',
      title: 'Hard break',
      action: () => editor.chain().focus().setHardBreak().run(),
    },
    {
      icon: 'format-clear',
      title: 'Clear format',
      action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
    },
    {
      type: 'divider',
    },
    {
      icon: 'arrow-go-back-line',
      title: 'Undo',
      action: () => editor.chain().focus().undo().run(),
    },
    {
      icon: 'arrow-go-forward-line',
      title: 'Redo',
      action: () => editor.chain().focus().redo().run(),
    },
  ]

  return (
    <div className="editor__header">
      {items.map((item, index) => (
        <Fragment key={index}>
          {item.type === 'divider' ? <div className="divider" /> : <MenuItem {...item} />}
        </Fragment>
      ))}
    </div>
  )
}
