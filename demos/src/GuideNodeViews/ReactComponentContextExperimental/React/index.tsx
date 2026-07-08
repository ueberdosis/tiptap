import './styles.scss'

import { EditorContent, useReactEditor } from '@tiptap/react-experimental'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

import { Context } from './Context.js'
import ReactComponent from './Extension.js'

const contextValue = {
  value: 'Hi from react context!',
}

export default () => {
  const editor = useReactEditor({
    extensions: [StarterKit, ReactComponent],
    content: `
    <p>
      This editor is rendered by the experimental React renderer. The node
      view below reads a React context provided around the editor — no portal
      in between, context flows like in any other React tree.
    </p>
    <react-component count="0"></react-component>
    <p>
      Did you see that? That’s a React component reading React context.
    </p>
    `,
  })

  return (
    <Context.Provider value={contextValue}>
      <EditorContent editor={editor} />
    </Context.Provider>
  )
}
