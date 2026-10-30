import './styles.scss'

import Document from '@tiptap/extension-document'
import FindAndReplace from '@tiptap/extension-find-and-replace'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { useState } from 'react'

const ContinuedParagraph = Paragraph.extend({
  addAttributes() {
    return {
      continued: {
        default: false,
        renderHTML: attributes => (attributes.continued ? { 'data-continued': '' } : {}),
      },
    }
  },
})

const paragraph = (text, continued = false) => ({
  type: 'paragraph',
  attrs: { continued },
  content: [{ type: 'text', text }],
})

export default () => {
  const [searchInput, setSearchInput] = useState('')
  const editor = useEditor({
    extensions: [
      Document,
      ContinuedParagraph,
      Text,
      FindAndReplace.configure({ continuesNode: node => node.attrs.continued === true }),
    ],
    // JSON keeps the trailing spaces that HTML parsing would trim
    content: {
      type: 'doc',
      content: [
        paragraph('The dashed paragraph continues this one. The quick brown '),
        paragraph('fox jumps over the lazy dog.', true),
        paragraph('This paragraph does not continue into the next one. The sleepy '),
        paragraph('cat stays apart.'),
      ],
    },
  })

  const { replaceTerm, resultCount, currentIndex } = useEditorState({
    editor,
    selector: ctx => ({
      replaceTerm: ctx.editor.storage.findAndReplace.replaceTerm,
      resultCount: ctx.editor.storage.findAndReplace.results.length,
      currentIndex: ctx.editor.storage.findAndReplace.currentIndex,
    }),
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <input
            type="text"
            placeholder="Search"
            aria-label="Search"
            value={searchInput}
            onChange={event => {
              setSearchInput(event.currentTarget.value)
              editor.commands.setSearchTerm(event.currentTarget.value)
            }}
          />
          <input
            type="text"
            placeholder="Replace"
            aria-label="Replace"
            value={replaceTerm}
            onChange={event => editor.commands.setReplaceTerm(event.currentTarget.value)}
          />
          <button onClick={() => editor.commands.goToNextResult()} disabled={resultCount === 0}>
            Next
          </button>
          <button onClick={() => editor.commands.replace()} disabled={resultCount === 0}>
            Replace
          </button>
          <span className="result-count" data-testid="result-count">
            {resultCount === 0 ? 'No results' : `${(currentIndex ?? 0) + 1} of ${resultCount}`}
          </span>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
