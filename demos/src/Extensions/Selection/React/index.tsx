import './styles.scss'

import Code from '@tiptap/extension-code'
import Document from '@tiptap/extension-document'
import { BulletList, ListItem } from '@tiptap/extension-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Selection } from '@tiptap/extensions'
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
          The selection extension adds a class to the selected text when the editor loses focus. This lets you keep the selection visible even while the editor is blurred. By default, it adds the <code>.selection</code> class name.
        </p>
      `,

    onCreate: ctx => {
      ctx.editor.commands.setTextSelection({ from: 5, to: 30 })
    },
  })

  return <EditorContent editor={editor} />
}
