import { type Extensions, type JSONContent, getSchema } from '@tiptap/core'
import { Node } from '@tiptap/pm/model'

import { getHTMLFromFragment } from './getHTMLFromFragment.js'

/**
 * This function generates HTML from a ProseMirror JSON content object.
 *
 * @remarks **Important**: This function requires `happy-dom` to be installed in your project.
 * @param doc - The ProseMirror JSON content object.
 * @param extensions - The Tiptap extensions used to build the schema.
 * @returns The generated HTML string.
 * @example
 * ```js
 * const html = generateHTML(doc, extensions)
 * console.log(html)
 * ```
 */
export function generateHTML(doc: JSONContent, extensions: Extensions): string {
  if (typeof window !== 'undefined') {
    throw new Error(
      'generateHTML can only be used in a Node environment\nIf you want to use this in a browser environment, use the `@tiptap/html` import instead.',
    )
  }

  const schema = getSchema(extensions)
  const contentNode = Node.fromJSON(schema, doc)

  return getHTMLFromFragment(contentNode, schema)
}
