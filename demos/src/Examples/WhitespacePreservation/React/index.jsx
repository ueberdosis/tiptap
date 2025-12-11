import './styles.scss'

import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React, { useState } from 'react'

export default () => {
  const [preserveWhitespace, setPreserveWhitespace] = useState(false)

  const editor = useEditor(
    {
      extensions: [
        Document,
        Text,
        Paragraph.configure({
          preserveWhitespace,
        }),
        Heading.configure({
          preserveWhitespace,
        }),
      ],
      content: `
        <h1>Test    Multiple    Spaces</h1>
        <p>This paragraph has    multiple    spaces    between    words.</p>
        <p>This paragraph has	tabs	between	words.</p>
        <p>    Leading spaces test</p>
        <p>Trailing spaces test    </p>
        <h2>Multiple		Tabs		In		Heading</h2>
        <p>Line one
Line two with preserved newline</p>
      `,
    },
    [preserveWhitespace],
  )

  if (!editor) {
    return <div>Loading editor...</div>
  }

  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" checked={preserveWhitespace} onChange={e => setPreserveWhitespace(e.target.checked)} />
          <span>Preserve Whitespace</span>
        </label>
        <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          Toggle this to see the difference in whitespace rendering. When enabled, tabs and multiple spaces are
          preserved.
        </p>
      </div>
      <EditorContent editor={editor} />
      <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <h3>HTML Output:</h3>
        <pre style={{ background: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
          {editor.getHTML()}
        </pre>
      </div>
    </div>
  )
}
