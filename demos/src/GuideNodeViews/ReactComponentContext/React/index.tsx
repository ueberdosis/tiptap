import './styles.scss'

import { EditorContent, useEditor } from '@dibdab/react'
import StarterKit from '@dibdab/starter-kit'
import React from 'react'

import { Context } from './Context.js'
import ReactComponent from './Extension.js'

const contextValue = {
  value: 'Hi from react context!',
}

export default () => {
  const editor = useEditor({
    extensions: [StarterKit, ReactComponent],
    content: `
    <p>
      This is still the text editor you’re used to, but enriched with node views.
    </p>
    <react-component count="0"></react-component>
    <p>
      Did you see that? That’s a React component. We are really living in the future.
    </p>
    `,
  })

  return (
    <Context.Provider value={contextValue}>
      <EditorContent editor={editor} />
    </Context.Provider>
  )
}
