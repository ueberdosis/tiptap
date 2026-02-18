import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Typography from '@tiptap/extension-typography'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  // Demonstrating automatic RTL detection via textDirection option
  const editorAuto = useEditor({
    extensions: [Document, Paragraph, Text, Typography],
    textDirection: 'rtl',
    content: `
        <p>اقتباس "مرحبا بالعالم" باللغة العربية</p>
        <p>Automatic RTL detection: </p>
      `,
  })

  // Demonstrating explicit RTL configuration
  const editorExplicit = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Typography.configure({
        doubleQuotes: {
          rtl: { open: '\u201D', close: '\u201C' },
        },
        singleQuotes: {
          rtl: { open: '\u2019', close: '\u2018' },
        },
      }),
    ],
    content: `
        <p dir="rtl">اقتباس "مرحبا بالعالم" باللغة العربية</p>
        <p dir="rtl">Explicit RTL config: </p>
      `,
  })

  return (
    <div>
      <h3>Automatic RTL Detection (textDirection: 'rtl')</h3>
      <div className="editor-auto">
        <EditorContent editor={editorAuto} />
      </div>

      <h3>Explicit RTL Configuration</h3>
      <div className="editor-explicit">
        <EditorContent editor={editorExplicit} />
      </div>
    </div>
  )
}
