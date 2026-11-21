import './styles.scss'

import Document from '@tiptap/extension-document'
import Mention from '@tiptap/extension-mention'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { CharacterCount } from '@tiptap/extensions'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import React from 'react'

import { CharacterCountGauge } from '../../../Components/CharacterCountGauge.jsx'
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
      if (!ctx.editor) {
        return {
          characterCount: 0,
        }
      }

      return {
        characterCount: ctx.editor.storage.characterCount.characters(),
      }
    },
  })

  const percentage = editor ? Math.round((100 / limit) * characterCount) : 0
  const isAtLimit = characterCount === limit

  return (
    <>
      <EditorContent editor={editor} />
      {editor && (
        <div className={`character-count ${isAtLimit ? 'character-count--warning' : ''}`}>
          <CharacterCountGauge percentage={percentage} />
          {characterCount} / {limit} characters
        </div>
      )}
    </>
  )
}
