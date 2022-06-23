import './styles.scss'

import Decorations from '@tiptap/extension-decorations'
import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Image, Decorations, HardBreak],
    content: `
        <p>This content should show decorations for invisible characters<br />This is default behaviour - you can override this by using Decorations.configure().</p>
        <p>Try editing the content to see different types of characters.</p>
      `,
  })

  return (
    <div>
      <div>
        <button onClick={() => editor.commands.showDecorations()}>Show decorators</button>
        <button onClick={() => editor.commands.hideDecorations()}>Hide decorators</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
