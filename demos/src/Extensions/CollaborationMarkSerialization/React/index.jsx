import React from 'react'
import { prosemirrorJSONToYDoc, yDocToProsemirrorJSON } from '@tiptap/y-tiptap'
import { Schema } from '@tiptap/pm/model'

const schema = new Schema({
  nodes: { doc: { content: 'paragraph+' }, paragraph: { content: 'text*' }, text: {} },
  marks: { bold: {}, comment: { attrs: { id: {} } } },
})

export default function Demo() {
  const document = prosemirrorJSONToYDoc(schema, {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Bold', marks: [{ type: 'bold' }] },
          { type: 'text', text: 'Comment', marks: [{ type: 'comment', attrs: { id: 'example' } }] },
        ],
      },
    ],
  })
  const output = yDocToProsemirrorJSON(document)
  document.destroy()
  return (
    <div className="output-group">
      <p>Bold marks omit empty attributes; comment marks keep their ID.</p>
      <pre>{JSON.stringify(output, null, 2)}</pre>
    </div>
  )
}
