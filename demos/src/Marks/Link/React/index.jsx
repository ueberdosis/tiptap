import './styles.scss'

import Code from '@tiptap/extension-code'
import Document from '@tiptap/extension-document'
import Link from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, MarkViewContent, ReactMarkViewRenderer, useEditor, useEditorState } from '@tiptap/react'
import React, { useCallback } from 'react'

export default () => {
  const CustomLink = Link.extend({
    addMarkView() {
      return ReactMarkViewRenderer(() => <MarkViewContent />)
    },
  })

  const editor = useEditor({
    editable: true,
    extensions: [Document, Paragraph, Text, Code, CustomLink],
    content: `
        <p>
    <a href="https://en.wikipedia.org/wiki/World_Wide_Web">world wide web</a>.
        </p>
      `,
  })

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()

      return
    }

    // update link
    try {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    } catch (e) {
      alert(e.message)
    }
  }, [editor])

  const editorState = useEditorState({
    editor,
    selector: ctx => ({
      isLink: ctx.editor.isActive('link'),
    }),
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button onClick={setLink} className={editorState.isLink ? 'is-active' : ''}>
            Set link
          </button>
          <button onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editorState.isLink}>
            Unset link
          </button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
