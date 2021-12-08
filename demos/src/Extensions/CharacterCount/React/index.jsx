import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import CharacterCount from '@tiptap/extension-character-count'
import './styles.scss'

const limit = 280

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      CharacterCount.configure({
        limit,
      }),
    ],
    content: `
        <p>
          Let‘s make sure people can’t write more than 280 characters. I bet you could build one of the biggest social networks on that idea.
        </p>
      `,
  })

  if (!editor) {
    return null
  }

  return (
    <div>
      <EditorContent editor={editor} />

      <div className="character-count">
        {editor.storage.characterCount.characters()}/{limit} characters
        <br />
        {editor.storage.characterCount.words()} words
      </div>
    </div>
  )
}
