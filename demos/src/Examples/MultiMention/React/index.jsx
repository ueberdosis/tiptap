import './styles.scss'

import Document from '@tiptap/extension-document'
import Mention from '@tiptap/extension-mention'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { useEditor, Tiptap } from '@tiptap/react'
import React from 'react'

import suggestions from './suggestions.js'

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestions,
      }),
    ],
    content: `
        <p>Hi everyone! Don’t forget the daily stand up at 8 AM.</p>
        <p>We will talk about the movies: <span data-type="mention" data-id="Dirty Dancing" data-mention-suggestion-char="#"></span>, <span data-type="mention" data-id="Pirates of the Caribbean" data-mention-suggestion-char="#"></span> and <span data-type="mention" data-id="The Matrix" data-mention-suggestion-char="#"></span>.</p>
        <p><span data-type="mention" data-id="Jennifer Grey"></span> Would you mind to share what you’ve been working on lately? We fear not much happened since <span data-type="mention" data-id="Dirty Dancing" data-mention-suggestion-char="#"></span>.</p>
        <p><span data-type="mention" data-id="Winona Ryder"></span> <span data-type="mention" data-id="Axl Rose"></span> Let’s go through your most important points quickly.</p>
        <p>I have a meeting with <span data-type="mention" data-id="Christina Applegate"></span> and don’t want to come late.</p>
        <p>– Thanks, your big boss</p>
      `,
  })

  if (!editor) {
    return null
  }

  return <Tiptap instance={editor}>
    <Tiptap.Content />
  </Tiptap>
}
