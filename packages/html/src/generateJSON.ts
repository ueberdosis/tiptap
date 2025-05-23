import type { Extensions } from '@tiptap/core'
import { getSchema } from '@tiptap/core'
import type { ParseOptions } from '@tiptap/pm/model'
import { DOMParser } from '@tiptap/pm/model'
import type { Document as HappyDOMDocument } from 'happy-dom-without-node'

import { createSafeParser } from './createSafeParser.js'
import { createSafeWindow } from './createSafeWindow.js'

/**
 * Generates a JSON object from the given HTML string and converts it into a Prosemirror node with content.
 * @param {string} html - The HTML string to be converted into a Prosemirror node.
 * @param {Extensions} extensions - The extensions to be used for generating the schema.
 * @param {ParseOptions} options - The options to be supplied to the parser.
 * @returns {Record<string, any>} - The generated JSON object.
 * @example
 * const html = '<p>Hello, world!</p>'
 * const extensions = [...]
 * const json = generateJSON(html, extensions)
 * console.log(json) // { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello, world!' }] }] }
 */
export function generateJSON(html: string, extensions: Extensions, options?: ParseOptions): Record<string, any> {
  const schema = getSchema(extensions)
  let doc: Document | HappyDOMDocument | null = null

  if (typeof window === 'undefined') {
    const window = createSafeWindow()
    const parser = createSafeParser(window)

    doc = parser.parseFromString(html, 'text/html')
  } else {
    doc = new window.DOMParser().parseFromString(html, 'text/html')
  }

  if (!doc) {
    throw new Error('Failed to parse HTML string')
  }

  return DOMParser.fromSchema(schema)
    .parse(doc.body as Node, options)
    .toJSON()
}
