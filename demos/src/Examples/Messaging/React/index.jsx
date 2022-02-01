import React, { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Placeholder from '@tiptap/extension-placeholder'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Blockquote from '@tiptap/extension-blockquote'
import Code from '@tiptap/extension-code'
import CodeBlock from '@tiptap/extension-code-block'
import Image from '@tiptap/extension-image'
import Dropcursor from '@tiptap/extension-dropcursor'
import Mention from '@tiptap/extension-mention'

import mentionSuggestion from './mention-suggestion'
import { content } from '../content'
import TextformattingMenu from './TextformattingMenu'
import './styles.scss'

const CustomDocument = Document.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => {
        document.getElementById('send').click()
      },
    }
  },
})

export default () => {
  const [json, setJson] = useState(null)
  const editor = useEditor({
    extensions: [
      CustomDocument,
      Paragraph,
      Text,
      Placeholder,
      Bold,
      Italic,
      Strike,
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      Code,
      CodeBlock,
      Image,
      Dropcursor,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: mentionSuggestion,
      }),
    ],
    content,
  })

  const mention = {
    type: 'mention',
    attrs: {
      id: 1,
      label: 'Lea Thompson',
    },
  }

  useEffect(() => {
    if (!editor) {
      return null
    }

    // Get the initial content …
    setJson(editor.getJSON())

    // … and get the content after every change.
    editor.on('update', () => {
      setJson(editor.getJSON())
    })
  }, [editor])

  const [messages, setMessages] = useState([])
  const addMessage = () => {
    if (editor.isEmpty) {
      return null
    }

    setMessages([{
      value: `Message ${messages.length} ${JSON.stringify(json, null, 2)}`,
    }, ...messages])

    editor.commands.clearContent()
    document.getElementsByClassName('conversation')[0].scrollTo(0, 0)
  }

  return (
    <div className='messenger'>
      <div className='conversation'>
        {messages.map((message, key) => (
          <pre key={key}><code>{message.value}</code></pre>
        ))}
      </div>
      <div className='editor'>
        <header>
          <TextformattingMenu editor={editor} />
        </header>
        <main>
          <EditorContent editor={editor} />
        </main>
        <footer>
          <nav>
            <div className='button-group'>
              <button onClick={() => editor.chain().focus().insertContent(mention).run()}>set mention</button>
              <button onClick={() => editor.chain().focus().insertContent(' @').run()}>select mention</button>
            </div>
            <div className='button-group'>
              <button id="send" onClick={addMessage}>send</button>
            </div>
          </nav>
        </footer>
      </div>
    </div>
  )
}
