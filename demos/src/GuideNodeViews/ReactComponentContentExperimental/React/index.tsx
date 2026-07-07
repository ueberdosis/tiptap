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
      This editor is rendered by the experimental React renderer.
    </p>
    <react-component>This is editable. You can create a new component by pressing Mod+Enter.</react-component>
    <p>
      The component above renders its editable content through contentDOMRef,
      without a wrapper element or portal.
    </p>
    `,
  })

  return <EditorContent editor={editor} nodeViews={{ reactComponent: Component }} />
}
