import './styles.scss'

import Link from '@tiptap/extension-link'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        validate: link => /^https?:\/\//.test(link),
      }),
    ],
    content: `
      <p>Hey! Try to type in url with and without a http/s protocol. - Links without a protocol should not get auto linked</p>
    `,
    editorProps: {
      attributes: {
        spellcheck: 'false',
      },
    },
  })

  const setLink = React.useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink()
        .run()

      return
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url })
      .run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={setLink}
            className={editor.isActive('link') ? 'is-active' : ''}
            data-testid="setLink"
          >
            Set link
          </button>
          <button
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive('link')}
            data-testid="unsetLink"
          >
            Unset link
          </button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
