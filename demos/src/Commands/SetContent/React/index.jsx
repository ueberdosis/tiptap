import './styles.scss'

import { Mention as Mentions } from '@tiptap/editor/extensions/mention'
import { Color } from '@tiptap/editor/extensions/color'
import { TextStyle } from '@tiptap/editor/extensions/text-style'
import { EditorProvider } from '@tiptap/react'
import { StarterKit } from '@tiptap/editor/kits/starter'
import React from 'react'

const extensions = [Color, TextStyle, StarterKit, Mentions]

const content = ''

export default () => {
  return <EditorProvider extensions={extensions} content={content}></EditorProvider>
}
