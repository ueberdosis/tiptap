import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Strike from '@tiptap/extension-strike'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/solid'

export default function App() {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Strike],
    content: `
          <p>This isn't striked through.</s></p>
          <p><s>But that's striked through.</s></p>
          <p><del>And this.</del></p>
          <p><strike>This too.</strike></p>
          <p style="text-decoration: line-through">This as well.</p>
        `,
  })

  const state = useEditorState({
    editor: editor(),
    selector: ({ editor: ed }) => ({
      isStrike: ed.isActive('strike'),
    }),
  })

  return (
    <>
      <div class="control-group">
        <div class="button-group">
          <button
            onClick={() => editor().chain().focus().toggleStrike().run()}
            class={state().isStrike ? 'is-active' : ''}
          >
            Toggle strike
          </button>
          <button
            onClick={() => editor().chain().focus().setStrike().run()}
            disabled={state().isStrike}
          >
            Set strike
          </button>
          <button
            onClick={() => editor().chain().focus().unsetStrike().run()}
            disabled={!state().isStrike}
          >
            Unset strike
          </button>
        </div>
      </div>
      <EditorContent editor={editor()} />
    </>
  )
}
