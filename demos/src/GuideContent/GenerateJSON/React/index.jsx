import Bold from '@tiptap/extension-bold'
// Option 2: Browser-only (lightweight)
// import { generateJSON } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
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
  }, [html])

  return (
    <pre>
      <code>{JSON.stringify(output, null, 2)}</code>
    </pre>
  )
}
