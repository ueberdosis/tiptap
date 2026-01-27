import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Typography from '@tiptap/extension-typography'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Typography.configure({
        doubleQuotes: {
          rtl: { open: '”', close: '“' },
        },
        singleQuotes: {
          rtl: { open: '’', close: '‘' },
        },
      }),
    ],
    content: `
        <p dir="rtl">اقتباس "مرحبا بالعالم" باللغة العربية</p>
        <p dir="rtl">Type quotes here in RTL mode: </p>
      `,
  })

  return <EditorContent editor={editor} />
}
