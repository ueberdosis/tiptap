import type { Extensions, JSONContent } from '@tiptap/core'
import { getSchema } from '@tiptap/core'
import { Node } from '@tiptap/pm/model'

import { getHTMLFromFragment } from './getHTMLFromFragment.js'

/**
 * Generates HTML from a ProseMirror JSON content object.
 * @param doc - The ProseMirror JSON content object.
 * @param extensions - The Tiptap extensions used to build the schema.
 * @returns The generated HTML string.
 * @example
 * const doc = {
 *   type: 'doc',
 *   content: [
 *     {
 *       type: 'paragraph',
 *       content: [
 *         {
 *           type: 'text',
 *           text: 'Hello world!'
 *         }
 *       ]
 *     }
 *   ]
 * }
 * const extensions = [...]
 * const html = generateHTML(doc, extensions)
 */
export function generateHTML(doc: JSONContent, extensions: Extensions): string {
  if (typeof window === 'undefined') {
    throw new Error(
      'generateHTML can only be used in a browser environment\nIf you want to use this in a Node environment, use the `@tiptap/html/server` import instead.',
    )
  }

  const schema = getSchema(extensions)
  const contentNode = Node.fromJSON(schema, doc)

  return getHTMLFromFragment(contentNode, schema)
}
