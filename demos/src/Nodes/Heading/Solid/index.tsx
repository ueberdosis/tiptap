import './styles.scss'

import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/solid'

export default function App() {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading.configure({
        levels: [1, 2, 3],
      }),
    ],
    content: `
        <h1>This is a 1st level heading</h1>
        <h2>This is a 2nd level heading</h2>
        <h3>This is a 3rd level heading</h3>
        <h4>This 4th level heading will be converted to a paragraph, because levels are configured to be only 1, 2 or 3.</h4>
      `,
  })

  const state = useEditorState({
    editor: editor(),
    selector: ({ editor: ed }) => ({
      isH1: ed.isActive('heading', { level: 1 }),
      isH2: ed.isActive('heading', { level: 2 }),
      isH3: ed.isActive('heading', { level: 3 }),
    }),
  })

  return (
    <>
      <div class="control-group">
        <div class="button-group">
          <button
            onClick={() => editor().chain().focus().toggleHeading({ level: 1 }).run()}
            class={state().isH1 ? 'is-active' : ''}
          >
            H1
          </button>
          <button
            onClick={() => editor().chain().focus().toggleHeading({ level: 2 }).run()}
            class={state().isH2 ? 'is-active' : ''}
          >
            H2
          </button>
          <button
            onClick={() => editor().chain().focus().toggleHeading({ level: 3 }).run()}
            class={state().isH3 ? 'is-active' : ''}
          >
            H3
          </button>
        </div>
      </div>

      <EditorContent editor={editor()} />
    </>
  )
}
