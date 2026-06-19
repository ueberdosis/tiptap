import './styles.scss'

import { Color, TextStyle } from '@tiptap/extension-text-style'
import { ListItem } from '@tiptap/extension-list'
import StarterKit from '@tiptap/starter-kit'
import { Tiptap, useEditor } from '@tiptap/solid'

import Toolbar from './Toolbar.jsx'

export default function App() {
  const editor = useEditor({
    extensions: [
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle.configure(),
      StarterKit,
    ],
    content: `
      <h2>Hi there,</h2>
      <p>this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you'd probably expect from a text editor. But wait until you see the lists:</p>
      <ul>
        <li>That's a bullet list with one …</li>
        <li>… or two list items.</li>
      </ul>
      <p>Isn't that great? And all of that is editable. But wait, there's more. Let's try a code block:</p>
      <pre><code class="language-css">body {\n  display: none;\n}</code></pre>
      <p>I know, I know, this is impressive. It's only the tip of the iceberg though. Give it a try and click a little bit around. Don't forget to check the other examples too.</p>
      <blockquote>Wow, that's amazing. Good work, boy! 👏<br />— Mom</blockquote>
    `,
  })

  return (
    <Tiptap editor={editor()}>
      <Toolbar />
      <Tiptap.Content />
    </Tiptap>
  )
}
