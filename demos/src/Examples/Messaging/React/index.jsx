import React from 'react'
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
import Emoji, { gitHubEmojis } from '@tiptap-pro/extension-emoji'

import mentionSuggestion from './mention-suggestion'
import emogiSuggestion from './emoji-suggestion'
import { content } from '../content'
import TextformattingMenu from './TextformattingMenu'
import FunctionsMenu from './FunctionsMenu'
import './styles.scss'

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
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
      Emoji.configure({
        emojis: gitHubEmojis,
        enableEmoticons: true,
        suggestion: emogiSuggestion,
      }),
    ],
    content,
  })

  return (
    <div className='messenger'>
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
