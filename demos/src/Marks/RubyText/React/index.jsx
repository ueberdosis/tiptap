// fallow-ignore-file unused-file
import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import RubyText from '@tiptap/extension-ruby-text'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const [rt, setRt] = React.useState('')

  const editor = useEditor({
    extensions: [Document, Paragraph, Text, RubyText],
    content: `
        <p><ruby>東京<rt>とうきょう</rt></ruby>は日本の首都です。</p>
        <p><ruby>漢字<rt>かんじ</rt></ruby>の上にルビを表示できます。</p>
      `,
    onSelectionUpdate: ({ editor: currentEditor }) => {
      setRt(currentEditor.getAttributes('rubyText').rt ?? '')
    },
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <form
          className="button-group"
          onSubmit={event => {
            event.preventDefault()
            editor.chain().focus().setRubyText({ rt }).run()
          }}
        >
          <label>
            Ruby text (rt):
            <input
              data-test-id="ruby-text-input"
              type="text"
              value={rt}
              onChange={event => setRt(event.target.value)}
            />
          </label>
          <button
            data-test-id="set-ruby-text-button"
            type="submit"
            disabled={editor.state.selection.empty}
          >
            Set ruby text
          </button>
          <button
            data-test-id="unset-ruby-text-button"
            type="button"
            onClick={() => editor.chain().focus().unsetRubyText().run()}
            disabled={!editor.isActive('rubyText')}
          >
            Unset ruby text
          </button>
        </form>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
