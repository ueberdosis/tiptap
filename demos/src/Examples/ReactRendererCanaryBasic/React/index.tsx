import './styles.scss'

import { TextStyleKit } from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

import { MenuBar } from './MenuBar.jsx'

// Canary demo for the React-native renderer redesign.
//
// Flip `?renderer=react` on the URL to opt the editor into the experimental
// React-native renderer once it lands. With no query param this falls back to
// the legacy portal renderer, so we can A/B the same content side-by-side.
//
const useReactRenderer =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('renderer') === 'react'

const extensions = [TextStyleKit, StarterKit]

export default () => {
  const editor = useEditor({
    extensions,
    experimentalReactRenderer: useReactRenderer,
    content: `
<h2>
  Canary: basic editing
</h2>
<p>
  This demo mirrors <code>Examples/Default</code> and is the smoke-test target
  for the React-native renderer. Use <code>?renderer=react</code> to opt in
  once the flag is wired up.
</p>
<p>
  Renderer: <strong>${useReactRenderer ? 'react (experimental)' : 'portal (legacy)'}</strong>
</p>
<ul>
  <li>Bullets render through marks &amp; nodes.</li>
  <li>Watch the console for <code>flushSync</code> warnings under load.</li>
</ul>
<pre><code class="language-css">body { display: none; }</code></pre>
<blockquote>Selection should stay glued to the caret across renders.</blockquote>
`,
  })

  return (
    <>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </>
  )
}
