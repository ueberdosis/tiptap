import './styles.scss'

import Bold from '@tiptap/extension-bold'
import Collaboration from '@tiptap/extension-collaboration'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Placeholder } from '@tiptap/extensions'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus'
import React from 'react'
import { WebrtcProvider } from 'y-webrtc'
import * as Y from 'yjs'

const ydoc = new Y.Doc()

// oxlint-disable-next-line no-unused-vars
const provider = new WebrtcProvider('tiptap-collaboration-extension', ydoc)

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading,
      Bold,
      Collaboration.configure({
        document: ydoc,
      }),
      Placeholder.configure({
        placeholder:
          'Write something … It’ll be shared with everyone else looking at this example.',
      }),
    ],
  })

  const { isBold, isHeading1 } = useEditorState({
    editor,
    selector: ctx => ({
      isBold: ctx.editor.isActive('bold') ?? false,
      isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
    }),
  })

  return (
    <>
      {editor && (
        <>
          <BubbleMenu editor={editor}>
            <div className="bubble-menu">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={isBold ? 'is-active' : ''}
              >
                Bold
              </button>
            </div>
          </BubbleMenu>
          <FloatingMenu editor={editor}>
            <div className="floating-menu">
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={isHeading1 ? 'is-active' : ''}
              >
                H1
              </button>
            </div>
          </FloatingMenu>
        </>
      )}
      <EditorContent editor={editor} />
    </>
  )
}
