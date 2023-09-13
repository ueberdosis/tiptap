import './styles.scss'

import { EditorContent, FloatingMenu, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

import Foo from './foo.js'

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit, Foo,
    ],
    content: `
      <p><span data-foo=''>foo</span></p>
    `,
  })

  return (
    <>
      {editor && <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <div>Hello</div>
      </FloatingMenu>}
      <EditorContent editor={editor} />
    </>
  )
}
