import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

const TiptapComponent = ({
  onUpdate,
}) => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
    ],
    content: `
      <p>
        This is a radically reduced version of Tiptap. It has support for a document, with paragraphs and text. That’s it. It’s probably too much for real minimalists though.
      </p>
      <p>
        The paragraph extension is not really required, but you need at least one node. Sure, that node can be something different.
      </p>
    `,
    onUpdate,
  })

  return (
    <EditorContent editor={editor} />
  )
}

export default () => {
  const [index, setIndex] = React.useState(0)

  const handleUpdate = ({ editor: currentEditor }) => {
    console.log(index, 'onUpdate', currentEditor.getHTML()) // eslint-disable-line no-console
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button onClick={() => setIndex(index + 1)}>INC</button> = {index}
        </div>
      </div>
      <TiptapComponent onUpdate={handleUpdate} />
    </>
  )
}
