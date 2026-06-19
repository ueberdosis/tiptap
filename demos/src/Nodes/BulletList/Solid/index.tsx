import './styles.scss'

import Document from '@tiptap/extension-document'
import { BulletList, ListItem } from '@tiptap/extension-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/solid'

export default function App() {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, BulletList, ListItem],
    content: `
        <ul>
          <li>A list item</li>
          <li>And another one</li>
        </ul>
      `,
  })

  const state = useEditorState({
    editor: editor(),
    selector: ({ editor: ed }) => ({
      isBulletList: ed.isActive('bulletList'),
      canSplitListItem: ed.can().splitListItem('listItem'),
      canSinkListItem: ed.can().sinkListItem('listItem'),
      canLiftListItem: ed.can().liftListItem('listItem'),
    }),
  })

  return (
    <>
      <div class="control-group">
        <div class="button-group">
          <button
            onClick={() => editor().chain().focus().toggleBulletList().run()}
            class={state().isBulletList ? 'is-active' : ''}
          >
            Toggle bullet list
          </button>
          <button
            onClick={() => editor().chain().focus().splitListItem('listItem').run()}
            disabled={!state().canSplitListItem}
          >
            Split list item
          </button>
          <button
            onClick={() => editor().chain().focus().sinkListItem('listItem').run()}
            disabled={!state().canSinkListItem}
          >
            Sink list item
          </button>
          <button
            onClick={() => editor().chain().focus().liftListItem('listItem').run()}
            disabled={!state().canLiftListItem}
          >
            Lift list item
          </button>
        </div>
      </div>

      <EditorContent editor={editor()} />
    </>
  )
}
