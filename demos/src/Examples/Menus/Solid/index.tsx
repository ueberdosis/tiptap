import './styles.scss'

import StarterKit from '@tiptap/starter-kit'
import { Tiptap, useEditor } from '@tiptap/solid'
import { BubbleMenu, FloatingMenu } from '@tiptap/solid/menus'

export default function App() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      <p>Try to select <em>this text</em> to see what we call the bubble menu.</p>
      <p>Neat, isn't it? Add an empty paragraph to see the floating menu.</p>
    `,
  })

  return (
    <Tiptap editor={editor()}>
      <BubbleMenu editor={editor()}>
        <div class="bubble-menu">
          <button
            onClick={() => editor().chain().focus().toggleBold().run()}
            class={editor().isActive('bold') ? 'is-active' : ''}
          >
            Bold
          </button>
          <button
            onClick={() => editor().chain().focus().toggleItalic().run()}
            class={editor().isActive('italic') ? 'is-active' : ''}
          >
            Italic
          </button>
          <button
            onClick={() => editor().chain().focus().toggleStrike().run()}
            class={editor().isActive('strike') ? 'is-active' : ''}
          >
            Strike
          </button>
        </div>
      </BubbleMenu>

      <FloatingMenu editor={editor()}>
        <div class="floating-menu">
          <button
            onClick={() => editor().chain().focus().toggleHeading({ level: 1 }).run()}
            class={editor().isActive('heading', { level: 1 }) ? 'is-active' : ''}
          >
            H1
          </button>
          <button
            onClick={() => editor().chain().focus().toggleHeading({ level: 2 }).run()}
            class={editor().isActive('heading', { level: 2 }) ? 'is-active' : ''}
          >
            H2
          </button>
          <button
            onClick={() => editor().chain().focus().toggleBulletList().run()}
            class={editor().isActive('bulletList') ? 'is-active' : ''}
          >
            Bullet list
          </button>
        </div>
      </FloatingMenu>

      <Tiptap.Content />
    </Tiptap>
  )
}
