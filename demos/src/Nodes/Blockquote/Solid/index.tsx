import './styles.scss'

import Blockquote from '@tiptap/extension-blockquote'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/solid'

export default function App() {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Blockquote],
    content: `
      <blockquote>
        Nothing is impossible, the word itself says "I'm possible!"
      </blockquote>
      <p>Audrey Hepburn</p>
    `,
  })

  const state = useEditorState({
    editor: editor(),
    selector: ({ editor: ed }) => ({
      isBlockquote: ed.isActive('blockquote'),
      canSetBlockquote: ed.can().setBlockquote(),
      canUnsetBlockquote: ed.can().unsetBlockquote(),
    }),
  })

  return (
    <>
      <div class="control-group">
        <div class="button-group">
          <button
            onClick={() => editor().chain().focus().toggleBlockquote().run()}
            class={state().isBlockquote ? 'is-active' : ''}
          >
            Toggle blockquote
          </button>
          <button
            onClick={() => editor().chain().focus().setBlockquote().run()}
            disabled={!state().canSetBlockquote}
          >
            Set blockquote
          </button>
          <button
            onClick={() => editor().chain().focus().unsetBlockquote().run()}
            disabled={!state().canUnsetBlockquote}
          >
            Unset blockquote
          </button>
        </div>
      </div>

      <EditorContent editor={editor()} />
    </>
  )
}
