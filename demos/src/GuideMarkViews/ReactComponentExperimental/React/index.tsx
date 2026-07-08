import './styles.scss'

import { EditorContent, useReactEditor } from '@tiptap/react-experimental'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

import Component from './Component.jsx'
import ReactComponent from './Extension.js'

export default () => {
  const editor = useReactEditor({
    extensions: [StarterKit, ReactComponent],
    content: `
    <p>
      This editor is rendered by the experimental React renderer, enriched
      with a React mark view.
    </p>
    <p>The marked text below is rendered by a plain React component:</p>
    <p>Some <react-component>marked content</react-component> in a paragraph.</p>
    `,
  })

  return <EditorContent editor={editor} markViews={{ reactComponent: Component }} />
}
