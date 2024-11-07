import './styles.scss'

// import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

import { InsertMenu } from './InsertMenu.jsx'
import { MenuBar } from './MenuBar.jsx'
import { TextMenu } from './TextMenu.jsx'

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: `
    <h2>Accessibility Demo</h2>
    <p>Tab into the demo & navigate around with only your keyboard</p>
    <p>Use <code>Alt + F10</code> to focus the menu bar</p>
    `,
    editorProps: {
      attributes: {
        // Make sure the editor is announced as a rich text editor
        'aria-label': 'Rich Text Editor',
        // editor accepts multiline input
        'aria-multiline': 'true',
        'aria-readonly': 'false',
      },
    },
  })

  return (
    <div role="application" className="editor-application">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <TextMenu editor={editor} />
      <InsertMenu editor={editor} />
    </div>
  )
}
