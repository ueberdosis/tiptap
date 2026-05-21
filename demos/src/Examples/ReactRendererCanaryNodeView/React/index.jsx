import './styles.scss'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

import ReactComponent from './Extension.js'

// Canary demo for React node views under the new renderer.
//
// This is the hottest path: today the React component inside `<react-component>`
// is rendered via a portal. Under the new renderer it becomes a first-class
// child of the document React tree (no portal, no flushSync). Toggle with
// `?renderer=react` once the flag lands.
//
// TODO(phase 2): pass `experimentalReactRenderer: useReactRenderer` to `useEditor`.
const useReactRenderer =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('renderer') === 'react'

export default () => {
  const editor = useEditor({
    extensions: [StarterKit, ReactComponent],
    // experimentalReactRenderer: useReactRenderer,
    content: `
    <p>
      Canary: React node views. Renderer:
      <strong>${useReactRenderer ? 'react (experimental)' : 'portal (legacy)'}</strong>.
    </p>
    <react-component count="0"></react-component>
    <p>
      The counter node above should keep its React state across edits in both modes.
    </p>
    `,
  })

  return <EditorContent editor={editor} />
}
