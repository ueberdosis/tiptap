import React from 'react'
import TextformattingMenu from './TextformattingMenu'
import FunctionsMenu from './FunctionsMenu'
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Blockquote from '@tiptap/extension-blockquote'
import Code from '@tiptap/extension-code'
import CodeBlock from '@tiptap/extension-code-block'
import Placeholder from '@tiptap/extension-placeholder'
import { content } from '../content'
import './styles.scss'

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Strike,
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      Code,
      CodeBlock,
      Placeholder,
    ],
    content,
  })

  return (
    <div className='message-box'>
      <header>
        <TextformattingMenu editor={editor} />
      </header>
      <main>
        <EditorContent editor={editor} />
      </main>
      <footer>
        <FunctionsMenu editor={editor} />
      </footer>
    </div>
  )
}
