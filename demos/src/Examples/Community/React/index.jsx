import './styles.scss'

import Document from '@tiptap/extension-document'
import Mention from '@tiptap/extension-mention'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { CharacterCount } from '@tiptap/extensions'
import { useEditor, useEditorState, Tiptap } from '@tiptap/react'
import React from 'react'

import suggestion from './suggestion.js'

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
        What do you all think about the new <span data-type="mention" data-id="Winona Ryder"></span> movie?
      </p>
    `,
  })

  const { characterCount } = useEditorState({
    editor,
    selector: ctx => {
      return {
        characterCount: ctx.editor.storage.characterCount.characters(),
      }
    },
  })

  const percentage = editor ? Math.round((100 / limit) * characterCount) : 0

  return (
    <>
      <Tiptap instance={editor}>
        <Tiptap.Content />
      </Tiptap>
      {editor && (
        <div
          className={`character-count ${editor.storage.characterCount.characters() === limit ? 'character-count--warning' : ''}`}
        >
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
          {editor.storage.characterCount.characters()} / {limit} characters
        </div>
      )}
    </>
  )
}
