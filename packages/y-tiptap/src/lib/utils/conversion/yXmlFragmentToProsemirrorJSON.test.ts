import { expect, it } from 'vite-plus/test'
import * as Y from 'yjs'
import { schema } from '../../../../tests/utils/testSchema.js'
import { prosemirrorJSONToYXmlFragment } from './prosemirrorJSONToYXmlFragment.js'
import { yXmlFragmentToProsemirrorJSON } from './yXmlFragmentToProsemirrorJSON.js'

it('omits empty mark attributes and preserves populated attributes', () => {
  const content = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'strong' }], text: 'bold' },
          { type: 'text', marks: [{ type: 'comment', attrs: { id: 4 } }], text: 'comment' },
        ],
      },
    ],
  }
  const document = new Y.Doc()
  try {
    const fragment = document.getXmlFragment('prosemirror')
    prosemirrorJSONToYXmlFragment(schema, content, fragment)
    expect(yXmlFragmentToProsemirrorJSON(fragment)).toEqual(content)
  } finally {
    document.destroy()
  }
})
