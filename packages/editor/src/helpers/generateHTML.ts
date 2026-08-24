import { Node } from '@tiptap/pm/model'

import type { Extensions, JSONContent } from '../types.js'
import { getHTMLFromFragment } from './getHTMLFromFragment.js'
import { getSchema } from './getSchema.js'

/**
 * Generate HTML from a JSONContent
 * @param doc The JSONContent to generate HTML from
 * @param extensions The extensions to use for the schema
 * @returns The generated HTML
 */
export function generateHTML(doc: JSONContent, extensions: Extensions): string {
  const schema = getSchema(extensions)
  const contentNode = Node.fromJSON(schema, doc)

  return getHTMLFromFragment(contentNode.content, schema)
}
