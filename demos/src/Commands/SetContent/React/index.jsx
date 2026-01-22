import './styles.scss'

import Mentions from '@dibdab/extension-mention'
import { Color, TextStyle } from '@dibdab/extension-text-style'
import { EditorProvider } from '@dibdab/react'
import StarterKit from '@dibdab/starter-kit'
import React from 'react'

const extensions = [Color, TextStyle, StarterKit, Mentions]

const content = ''

export default () => {
  return <EditorProvider extensions={extensions} content={content}></EditorProvider>
}
