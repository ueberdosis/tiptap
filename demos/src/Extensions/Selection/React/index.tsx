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
          The Selection extension adds a class to the current text selection when the editor is blurred, which lets you keep the selected text highlighted even after the editor loses focus. This is especially useful when a selection spans multiple wrapped lines, where only the selected text should be highlighted rather than the empty space at the end of each line. By default it adds a <code>.selection</code> classname that you can style.
        </p>
      `,

    onCreate: ctx => {
      ctx.editor.commands.setTextSelection({ from: 5, to: 280 })
    },
  })

  return <EditorContent editor={editor} />
}
