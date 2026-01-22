import Document from '@dibdab/extension-document'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import Typography from '@dibdab/extension-typography'
import { EditorContent, useEditor } from '@dibdab/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Typography.configure({
        rightArrow: '=====>',
      }),
    ],
    content: `
        <p>“I have been suffering from Typomania all my life, a sickness that is incurable but not lethal.”</p>
        <p>— Erik Spiekermann, December 2008</p>
      `,
  })

  return <EditorContent editor={editor} />
}
