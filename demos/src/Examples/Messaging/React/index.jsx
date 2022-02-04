import React, { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Document from '@tiptap/extension-document'
import Placeholder from '@tiptap/extension-placeholder'
import Mention from '@tiptap/extension-mention'

import mentionSuggestion from './mention-suggestion'
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
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        document: false,
        hardBreak: false,
      }),
      CustomDocument,
      Text,
      Placeholder,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: mentionSuggestion,
      }),
    ],
    content:
      '<p>This is <em><s>a extensive</s> a simple </em><strong><em>messaging</em></strong><em> </em><strong><em>example</em></strong><em> </em>with <code>@</code>-mentions <span data-type="mention" class="mention" data-id="Madonna" contenteditable="false">@Madonna</span><em>.</em></p><p>In addition you can send the message by clicking <strong><em>send button</em></strong> or hitting <code>cmd+enter</code> on mac or <code>ctrl+enter</code> on pc.</p>',
  })

  const mention = {
    type: 'mention',
    attrs: {
      id: 1,
      label: 'Lea Thompson',
    },
  }

  const [messages, setMessages] = useState([])
  const addMessage = () => {
    if (editor.isEmpty) {
      return null
    }

    const json = editor.getJSON()

    setMessages([{
      value: `Message ${messages.length} ${JSON.stringify(json, null, 2)}`,
    }, ...messages])

    editor.chain().clearContent().focus().run()
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
