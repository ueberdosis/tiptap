import './styles.scss'

import Document from '@tiptap/extension-document'
import Italic from '@tiptap/extension-italic'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/solid'

export default function App() {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Italic],
    content: `
        <p>This isn't italic.</p>
        <p><em>This is italic.</em></p>
        <p><i>And this.</i></p>
        <p style="font-style: italic">This as well.</p>
      `,
  })

  const state = useEditorState({
    editor: editor(),
    selector: ({ editor: ed }) => ({
      isItalic: ed.isActive('italic'),
    }),
  })

  return (
    <>
      <div class="control-group">
        <div class="button-group">
          <button
            onClick={() => editor().chain().focus().toggleItalic().run()}
            class={state().isItalic ? 'is-active' : ''}
          >
            Toggle italic
          </button>
          <button
            onClick={() => editor().chain().focus().setItalic().run()}
            disabled={state().isItalic}
          >
            Set italic
          </button>
          <button
            onClick={() => editor().chain().focus().unsetItalic().run()}
            disabled={!state().isItalic}
          >
            Unset italic
          </button>
        </div>
      </div>
      <EditorContent editor={editor()} />
    </>
  )
}
