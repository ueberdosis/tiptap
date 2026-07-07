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
    <h2>Experimental React renderer</h2>
    <p>
      This editor is rendered by the experimental React renderer: React owns the
      document DOM, so there is no wrapper element and no portal around the node view.
    </p>
    <p>
      Rich text works too: <strong>bold</strong>, <em>italic</em>, <s>strike</s>,
      and <code>code</code>.
    </p>
    <ul>
      <li>Try the markdown input rules: type <code>**bold**</code> or <code>## heading</code>.</li>
      <li>Paste formatted content to exercise the paste rules.</li>
    </ul>
    <react-component count="0"></react-component>
    <p>
      The component above this paragraph is a plain React component.
    </p>
    `,
  })

  return <EditorContent editor={editor} nodeViews={{ reactComponent: Component }} />
}
