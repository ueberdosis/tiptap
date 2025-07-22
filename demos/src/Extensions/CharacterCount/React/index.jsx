import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { CharacterCount } from '@tiptap/extensions'
import { EditorContent, useEditor } from '@tiptap/react'
import React, { useState } from 'react'

const limit = 280

export default () => {
  const [charactersCount, setCharactersCount] = useState(0)
  const [wordsCount, setWordsCount] = useState(0)

  const handleUpdate = e => {
    setCharactersCount(e.storage.characterCount.characters())
    setWordsCount(e.storage.characterCount.words())
  }

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
    onUpdate: event => handleUpdate(event.editor),
    onCreate: event => handleUpdate(event.editor),
  })

  if (!editor) {
    return null
  }

  const percentage = editor ? Math.round((100 / limit) * charactersCount) : 0

  return (
    <>
      <EditorContent editor={editor} />

      <div className={`character-count ${charactersCount === limit ? 'character-count--warning' : ''}`}>
        <svg height="20" width="20" viewBox="0 0 20 20">
          <circle r="10" cx="10" cy="10" fill="#e9ecef" />
          <circle
            r="5"
            cx="10"
            cy="10"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={`calc(${percentage} * 31.4 / 100) 31.4`}
            transform="rotate(-90) translate(-20)"
          />
          <circle r="6" cx="10" cy="10" fill="white" />
        </svg>
        {charactersCount} / {limit} characters
        <br />
        {wordsCount} words
      </div>
    </>
  )
}
