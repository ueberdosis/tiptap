import './styles.scss'

import { EditorContent, useEditor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect } from 'react'

export default () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      <p>
        Hey, try to select some text here. There will popup a menu for selecting some inline styles. Remember: you have full control about content and styling of this menu.
      </p>
      <p>
        If you have a lot of content, when you scroll the page, your pop-up menu will scroll with your page, thanks to <strong>autoUpdate</strong>, if you enable it
      </p>
      <p>
        You can also toggle the menu visibility with the button above, or make the editor non-editable to see that the menu won't show up when selecting text.
      </p>
      <p>
        This is just a basic example, you can customize it as you want!
      </p>
      <p>There is a lot of content here, which makes your page scrollable</p>
      <p>There is a lot of content here, which makes your page scrollable</p>
      <p>There is a lot of content here, which makes your page scrollable</p>
      <p>There is a lot of content here, which makes your page scrollable</p>
      <p>There is a lot of content here, which makes your page scrollable</p>
      <p>There is a lot of content here, which makes your page scrollable</p>
      <p>There is a lot of content here, which makes your page scrollable</p>
    `,
  })

  const [showMenu, setShowMenu] = React.useState(true)
  const [isEditable, setIsEditable] = React.useState(true)

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable)
    }
  }, [isEditable, editor])

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setShowMenu(old => !old)
          editor.commands.focus()
        }}
      >
        Toggle menu
      </button>
      <div className="control-group">
        <label>
          <input type="checkbox" checked={isEditable} onChange={() => setIsEditable(!isEditable)} />
          Editable
        </label>
      </div>

      {editor && showMenu && (
        <BubbleMenu editor={editor} options={{ placement: 'bottom', offset: 8, flip: true, autoUpdate: true }}>
          <div className="bubble-menu">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'is-active' : ''}
              type="button"
            >
              Bold
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'is-active' : ''}
              type="button"
            >
              Italic
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive('strike') ? 'is-active' : ''}
              type="button"
            >
              Strike
            </button>
          </div>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </>
  )
}
