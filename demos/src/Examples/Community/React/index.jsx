import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import CharacterCount from '@tiptap/extension-character-count'
import Mention from '@tiptap/extension-mention'
import suggestion from './suggestion'
import './styles.scss'

export default () => {
  const limit = 280

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      CharacterCount.configure({
        limit,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion,
      }),
    ],
    content: `
      <p>
        What do you all think about the new <span data-mention data-id="Winona Ryder"></span> movie?
      </p>
    `,
  })

  const percentage = editor
    ? Math.round((100 / limit) * editor.getCharacterCount())
    : 0

  return (
    <div>
      <EditorContent editor={editor} />
      {editor
        && <div className={`character-count ${editor.getCharacterCount() === limit ? 'character-count--warning' : ''}`}>
          <svg
            height="20"
            width="20"
            viewBox="0 0 20 20"
            className="character-count__graph"
          >
            <circle
              r="10"
              cx="10"
              cy="10"
              fill="#e9ecef"
            />
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
            <circle
              r="6"
              cx="10"
              cy="10"
              fill="white"
            />
          </svg>

          <div className="character-count__text">
            {editor.getCharacterCount()}/{limit} characters
          </div>
        </div>
      }
    </div>
  )
}
