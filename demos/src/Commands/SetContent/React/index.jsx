import './styles.scss'

import ListItem from '@tiptap/extension-list-item'
import Mentions from '@tiptap/extension-mention'
import { Color , TextStyle } from '@tiptap/extension-text-style'
import { EditorProvider } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure({ types: [ListItem.name] }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
    },
    orderedList: {
      keepMarks: true,
    },
  }),
  Mentions,
]

const content = ''

export default () => {
  return <EditorProvider extensions={extensions} content={content}></EditorProvider>
}
