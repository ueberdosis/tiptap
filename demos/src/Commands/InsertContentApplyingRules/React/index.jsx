import './styles.scss'

import { EditorProvider, useCurrentEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useState } from 'react'

const MenuBar = () => {
  const { editor } = useCurrentEditor()
  const [useInputRules, setUseInputRules] = useState(true)
  const [usePasteRules, setUsePasteRules] = useState(false)

  if (!editor) {
    return null
  }

  return (
    <div className="control-group">
      <div>
        <label>
          <input
            type="checkbox"
            checked={useInputRules}
            onChange={() => setUseInputRules(prev => !prev)}
          />
          Apply input rules
        </label>
        <label>
          <input
            type="checkbox"
            checked={usePasteRules}
            onChange={() => setUsePasteRules(prev => !prev)}
          />
          Apply paste rules
        </label>
      </div>

      <div className="button-group">
        <button
          onClick={() => {
            editor
              .chain()
              .insertContent('-', {
                applyInputRules: useInputRules,
                applyPasteRules: usePasteRules,
              })
              .focus()
              .run()
          }}
          data-test-1
        >
          Insert "-"
        </button>
        <button
          onClick={() => {
            editor
              .chain()
              .insertContent(' ', {
                applyInputRules: useInputRules,
                applyPasteRules: usePasteRules,
              })
              .focus()
              .run()
          }}
          data-test-2
        >
          Insert " "
        </button>
        <button
          onClick={() => {
            editor
              .chain()
              .insertContent('A', {
                applyInputRules: useInputRules,
                applyPasteRules: usePasteRules,
              })
              .focus()
              .run()
          }}
          data-test-3
        >
          Insert "A"
        </button>

        <br />

        <button
          onClick={() => {
            editor
              .chain()
              .insertContent('*this is', {
                applyInputRules: useInputRules,
                applyPasteRules: usePasteRules,
              })
              .focus()
              .run()
          }}
          data-test-4
        >
          Insert "*this is"
        </button>
        <button
          onClick={() => {
            editor
              .chain()
              .insertContent(' a test*', {
                applyInputRules: useInputRules,
                applyPasteRules: usePasteRules,
              })
              .focus()
              .run()
          }}
          data-test-5
        >
          Insert " a test*"
        </button>
        <button
          onClick={() => {
            editor
              .chain()
              .insertContent(' a test*, whooho', {
                applyInputRules: useInputRules,
                applyPasteRules: usePasteRules,
              })
              .focus()
              .run()
          }}
          data-test-6
        >
          Insert " a test*, whooho."
        </button>
        <button
          onClick={() => {
            editor
              .chain()
              .insertContent('*this is a test*, whooho.', {
                applyInputRules: useInputRules,
                applyPasteRules: usePasteRules,
              })
              .focus()
              .run()
          }}
          data-test-7
        >
          Insert "*this is a test*, whooho."
        </button>
        <button
          onClick={() => {
            editor
              .chain()
              .insertContent('*this is a test*', {
                applyInputRules: useInputRules,
                applyPasteRules: usePasteRules,
              })
              .focus()
              .run()
          }}
          data-test-8
        >
          Insert "*this is a test*"
        </button>
      </div>
    </div>
  )
}

const extensions = [
  StarterKit,
]

const content = ''

export default () => {
  return (
    <EditorProvider slotBefore={<MenuBar />} extensions={extensions} content={content}></EditorProvider>
  )
}
