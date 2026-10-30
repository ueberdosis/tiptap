import './styles.scss'

import { Placeholder } from '@tiptap/extensions'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: 'Write something …' })],
  })

  return (
    <>
      <div className="control-group">
        <label>
          Placeholder
          <input
            defaultValue="Write something …"
            onChange={event => editor?.commands.setPlaceholder(event.target.value)}
          />
        </label>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
