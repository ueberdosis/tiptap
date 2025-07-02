import { type Extensions, type JSONContent, getSchema } from '@tiptap/core'
import { Node } from '@tiptap/pm/model'

import { getHTMLFromFragment } from './getHTMLFromFragment.js'

export async function generateHTML(doc: JSONContent, extensions: Extensions): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error(
      'generateHTML can only be used in a Node environment\nIf you want to use this in a browser environment, use the `@tiptap/html` import instead.',
    )
  }

  const schema = getSchema(extensions)
  const contentNode = Node.fromJSON(schema, doc)

  return getHTMLFromFragment(contentNode, schema)
}
