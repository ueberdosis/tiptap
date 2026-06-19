import './styles.scss'

import { EditorContent, useEditor } from '@tiptap/solid'
import StarterKit from '@tiptap/starter-kit'

import { Context } from './context.js'
import SolidComponent from './Extension.js'

const contextValue = {
  value: 'Hi from solid context!',
}

export default function App() {
  const editor = useEditor({
    extensions: [StarterKit, SolidComponent],
    content: `
    <p>
      This is still the text editor you're used to, but enriched with node views.
    </p>
    <solid-component count="0"></solid-component>
    <p>
      Did you see that? That's a Solid component. We are really living in the future.
    </p>
    `,
  })

  return (
    <Context.Provider value={contextValue}>
      <EditorContent editor={editor()} />
    </Context.Provider>
  )
}
