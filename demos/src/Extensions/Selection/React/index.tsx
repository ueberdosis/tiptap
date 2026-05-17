import './styles.scss'

import Code from '@tiptap/editor/marks/code'
import Document from '@tiptap/editor/nodes/document'
import { BulletList } from '@tiptap/editor/nodes/bullet-list'
import { ListItem } from '@tiptap/editor/nodes/list-item'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
import { Selection } from '@tiptap/editor/extensions/selection'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Selection.configure({
        className: 'selection',
      }),
      Code,
      BulletList,
      ListItem,
    ],
    content: `
        <p>
          The selection extension adds a class to the selection when the editor is blurred. That enables you to visually preserve the selection even though the editor is blurred. By default, it’ll add <code>.selection</code> classname.
        </p>
      `,

    onCreate: ctx => {
      ctx.editor.commands.setTextSelection({ from: 5, to: 30 })
    },
  })

  return <EditorContent editor={editor} />
}
