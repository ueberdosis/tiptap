import './styles.scss'

import Hashtag from '@tiptap/extension-hashtag'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

import suggestion from './suggestion'

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Hashtag.configure({
        HTMLAttributes: {
          'data-type': 'hashtag',
        },
        suggestion,
      }),
    ],
    content: `
        <p>Hi everyone! Don’t forget the <span data-type="hashtag">#daily_standup</span> up at 8 AM.</p>
        <p>Would you mind to share what you’ve been working on lately? We fear not much happened since <span class="hashtag" data-type="hashtag">#dirty_dancing</span>.
        <p><span data-type="mention" data-id="Axl Rose"></span> Let’s go through your most important points quickly.</p>
        <p>I have a meeting with <span data-type="mention" data-id="Christina Applegate"></span> and don’t want to come late.</p>
        <p>– Thanks, your <span class="hashtag" data-type="hashtag">#big_boss</span></p>
      `,
  })

  if (!editor) {
    return null
  }

  return <EditorContent editor={editor} />
}
