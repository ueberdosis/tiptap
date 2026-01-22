import Bold from '@dibdab/extension-bold'
// Option 2: Browser-only (lightweight)
// import { generateJSON } from '@dibdab/core'
import Document from '@dibdab/extension-document'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
// Option 1: Browser + server-side
import { generateJSON } from '@dibdab/html'
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
