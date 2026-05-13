import './styles.scss'

import type { Editor } from '@tiptap/react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useState } from 'react'

const extensions = [StarterKit]

function MenuBar({
  editor,
  globalDirection,
  setGlobalDirection,
}: {
  editor: Editor
  globalDirection: 'ltr' | 'rtl' | 'auto' | undefined
  setGlobalDirection: (dir: 'ltr' | 'rtl' | 'auto' | undefined) => void
}) {
  return (
    <div className="control-group">
      <div className="button-group">
        <strong>Global Direction:</strong>
        <button
          onClick={() => setGlobalDirection(undefined)}
          className={globalDirection === undefined ? 'is-active' : ''}
        >
          None
        </button>
        <button onClick={() => setGlobalDirection('ltr')} className={globalDirection === 'ltr' ? 'is-active' : ''}>
          LTR
        </button>
        <button onClick={() => setGlobalDirection('rtl')} className={globalDirection === 'rtl' ? 'is-active' : ''}>
          RTL
        </button>
        <button onClick={() => setGlobalDirection('auto')} className={globalDirection === 'auto' ? 'is-active' : ''}>
          Auto
        </button>
      </div>

      <div className="button-group">
        <strong>Set Direction on Selection:</strong>
        <button onClick={() => editor.chain().focus().setTextDirection('ltr').run()}>Set LTR</button>
        <button onClick={() => editor.chain().focus().setTextDirection('rtl').run()}>Set RTL</button>
        <button onClick={() => editor.chain().focus().setTextDirection('auto').run()}>Set Auto</button>
        <button onClick={() => editor.chain().focus().unsetTextDirection().run()}>Unset Direction</button>
      </div>
    </div>
  )
}

export default () => {
  const [globalDirection, setGlobalDirection] = useState<'ltr' | 'rtl' | 'auto' | undefined>('auto')

  const editor = useEditor(
    {
      extensions,
      textDirection: globalDirection,
      content: `
<h2>Text Direction Support</h2>
<p>This demo showcases the text direction feature in Tiptap. You can set the global text direction for all content, or apply it to specific nodes using commands.</p>

<h3>English Text (LTR)</h3>
<p>This is a paragraph in English, which is a left-to-right language. The text flows naturally from left to right.</p>

<h3>Arabic Text (RTL)</h3>
<p>هذا مثال على نص باللغة العربية. اللغة العربية تُكتب من اليمين إلى اليسار.</p>

<h3>Hebrew Text (RTL)</h3>
<p>זהו דוגמה לטקסט בעברית. עברית נכתבת מימין לשמאל.</p>

<h3>Bidirectional Text</h3>
<p>This paragraph contains both English and Arabic: مرحبا بك في Tiptap! This demonstrates how the auto direction works.</p>
<p>Another example: Hello העולם שלום World!</p>

<h3>Lists</h3>
<ul>
  <li>English list item</li>
  <li>عنصر قائمة عربي</li>
  <li>Mixed: English and عربي together</li>
</ul>

<ol>
  <li>First item</li>
  <li>البند الثاني</li>
  <li>Third item: עברית</li>
</ol>

<blockquote>
  <p>This is a blockquote with مختلط mixed content.</p>
</blockquote>
`,
    },
    [globalDirection],
  )

  if (!editor) {
    return null
  }

  return (
    <div>
      <MenuBar editor={editor} globalDirection={globalDirection} setGlobalDirection={setGlobalDirection} />
      <EditorContent editor={editor} />
    </div>
  )
}
