import './styles.scss'

import { EditorContent, useEditor } from '@tiptap/solid'
import StarterKit from '@tiptap/starter-kit'

import SolidComponent from './Extension.js'

export default function App() {
  const editor = useEditor({
    extensions: [StarterKit, SolidComponent],
    content: `
    <p>
      This is still the text editor you're used to, but enriched with node views.
    </p>
    <solid-component>This is editable. You can create a new component by pressing Mod+Enter.</solid-component>
    <p>
      Did you see that? That's a Solid component. We are really living in the future.
    </p>
    `,
  })

  return <EditorContent editor={editor()} />
}
