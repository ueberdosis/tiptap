import './styles.scss'

import { EditorContent, useReactEditor } from '@tiptap/react-renderer-experimental'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

import Component from './Component.jsx'
import ReactComponent from './Extension.js'

export default () => {
  const editor = useReactEditor({
    extensions: [StarterKit, ReactComponent],
    content: `
    <p>
      This editor is rendered by the experimental React renderer: React owns the
      document DOM, so there is no wrapper element and no portal around the node view.
    </p>
    <react-component count="0"></react-component>
    <p>
      The component below the paragraph is a plain React component.
    </p>
    `,
  })

  return <EditorContent editor={editor} nodeViews={{ reactComponent: Component }} />
}
