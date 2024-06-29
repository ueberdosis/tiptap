import './styles.scss'

import Mention from '@tiptap/extension-mention'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

import mention from './mention.js'
import pageLink from './pageLink.js'

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.extend({ name: 'mention' }).configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: mention,
      }),
      Mention.extend({ name: 'page-link' }).configure({
        HTMLAttributes: {
          class: 'page-link',
        },
        suggestion: pageLink,
      }),
    ],
    content: `
        <p>Hi everyone! Don’t forget the daily stand up at 8 AM. Read <span data-type="page-link" data-id="Page about cats"></span></p>
        <p><span data-type="mention" data-id="Jennifer Grey"></span> Would you mind to share what you’ve been working on lately? We fear not much happened since Dirty Dancing.
        <p><span data-type="mention" data-id="Winona Ryder"></span> <span data-type="mention" data-id="Axl Rose"></span> Let’s go through your most important points quickly.</p>
        <p>I have a meeting with <span data-type="mention" data-id="Christina Applegate"></span> and don’t want to come late.</p>
        <p>– Thanks, your big boss</p>
      `,
  })

  if (!editor) {
    return null
  }

  return <EditorContent editor={editor} />
}
