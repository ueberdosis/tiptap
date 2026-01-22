import './styles.scss'

import Code from '@dibdab/extension-code'
import Document from '@dibdab/extension-document'
import { BulletList, ListItem } from '@dibdab/extension-list'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { Selection } from '@dibdab/extensions'
import { EditorContent, useEditor } from '@dibdab/react'
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
