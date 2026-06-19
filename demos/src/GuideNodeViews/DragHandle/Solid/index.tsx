import './styles.scss'

import { EditorContent, useEditor } from '@tiptap/solid'
import StarterKit from '@tiptap/starter-kit'

import DraggableItem from './Extension.js'

export default function App() {
  const editor = useEditor({
    extensions: [StarterKit, DraggableItem],
    content: `
        <p>This is a boring paragraph.</p>
        <div data-type="draggable-item">
          <p>Followed by a fancy draggable item.</p>
        </div>
        <div data-type="draggable-item">
          <p>And another draggable item.</p>
          <div data-type="draggable-item">
            <p>And a nested one.</p>
            <div data-type="draggable-item">
              <p>But can we go deeper?</p>
            </div>
          </div>
        </div>
        <p>Let's finish with a boring paragraph.</p>
      `,
  })

  return <EditorContent editor={editor()} />
}
