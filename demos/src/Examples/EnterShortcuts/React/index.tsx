import './styles.scss'

import { EditorContent, Extension, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

const CustomKeyboardShortcutExtension = Extension.create({
  name: 'customKeyboardShortcuts',
  // Set a higher priority to make sure this extension is executed first before the default keyboard shortcuts
  priority: 101,
  addKeyboardShortcuts() {
    return {
      'Ctrl-Enter': ctx => {
        // Creates a transaction with this custom meta set
        return ctx.editor.commands.setMeta('customKeyboardShortcutHandler', 'Ctrl-Enter')
      },
      'Meta-Enter': ctx => {
        // Creates a transaction with this custom meta set
        return ctx.editor.commands.setMeta('customKeyboardShortcutHandler', 'Meta-Enter')
      },
      'Shift-Enter': ctx => {
        return ctx.editor.commands.setMeta('customKeyboardShortcutHandler', 'Shift-Enter')
      },
    }
  },
})

export default () => {
  const [lastShortcut, setLastShortcut] = React.useState<string | null>(null)
  const editor = useEditor({
    extensions: [StarterKit, CustomKeyboardShortcutExtension],
    // Listen for the custom meta set in the transaction
    onTransaction: ({ transaction }) => {
      if (transaction.getMeta('customKeyboardShortcutHandler')) {
        switch (transaction.getMeta('customKeyboardShortcutHandler')) {
          case 'Ctrl-Enter':
            setLastShortcut('Ctrl-Enter')
            break
          case 'Meta-Enter':
            setLastShortcut('Meta-Enter')
            break
          case 'Shift-Enter':
            setLastShortcut('Shift-Enter')
            break
          default:
            break
        }
      }
    },
    content: `
      <p>
        Hey, try to hit Shift+Enter, Ctrl+Enter or Meta+Enter. The last shortcut hit will be displayed above.
      </p>
    `,
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
          >
            Italic
          </button>
        </div>
        <div className="hint">
          {lastShortcut
            ? `${lastShortcut} was the last shortcut hit, and was handled by React`
            : 'No shortcut has been hit yet, use Shift+Enter to trigger a shortcut handler'}
        </div>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
