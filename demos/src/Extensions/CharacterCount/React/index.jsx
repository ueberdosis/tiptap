import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { CharacterCount } from '@tiptap/extensions'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { useState } from 'react'

import { CharacterCountOutput } from './CharacterCountOutput.jsx'

const limits = [
  { value: 140, label: '140 characters' },
  { value: 280, label: '280 characters' },
  { value: null, label: 'No limit' },
]

export default () => {
  const [limit, setLimit] = useState(280)
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

  const { charactersCount, wordsCount } = useEditorState({
    editor,
    selector: context => ({
      charactersCount: context.editor.storage.characterCount.characters(),
      wordsCount: context.editor.storage.characterCount.words(),
    }),
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          {limits.map(({ value, label }) => (
            <button
              key={label}
              className={limit === value ? 'is-active' : ''}
              onClick={() => {
                editor.commands.setCharacterLimit(value)
                setLimit(value)
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <EditorContent editor={editor} />

      <CharacterCountOutput
        charactersCount={charactersCount}
        wordsCount={wordsCount}
        limit={limit}
        limitLabel={limit ?? 'unlimited'}
      />
    </>
  )
}
