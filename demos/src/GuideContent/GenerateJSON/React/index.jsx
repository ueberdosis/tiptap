import Bold from '@tiptap/editor/marks/bold'
// Option 2: Browser-only (lightweight)
// import { generateJSON } from '@tiptap/core'
import Document from '@tiptap/editor/nodes/document'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
// Option 1: Browser + server-side
import { generateJSON } from '@tiptap/html'
import React, { useMemo } from 'react'

const html = '<p>Example <strong>Text</strong></p>'

export default () => {
  const output = useMemo(() => {
    return generateJSON(html, [
      Document,
      Paragraph,
      Text,
      Bold,
      // other extensions …
    ])
  }, [])

  return (
    <pre>
      <code>{JSON.stringify(output, null, 2)}</code>
    </pre>
  )
}
