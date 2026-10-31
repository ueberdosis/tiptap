import { Markdown } from '@tiptap/markdown'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

export default () => {
  const editor = useEditor({
    extensions: [StarterKit, Markdown.configure({ transformPastedText: true })],
    content:
      '<p>Paste plain-text markdown here, for example <code># Title</code> or <code>**bold**</code>.</p>',
  })

  return <EditorContent editor={editor} />
}
