import { Extensions, getSchema } from '@tiptap/core'
import { DOMParser, ParseOptions } from '@tiptap/pm/model'
import { DOMParser as HappyDOMParser, Window as HappyDOMWindow } from 'happy-dom-without-node'

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

  const parseInstance =
    typeof window !== 'undefined' ? new window.DOMParser() : new HappyDOMParser(new HappyDOMWindow())

  return DOMParser.fromSchema(schema)
    .parse(parseInstance.parseFromString(html, 'text/html').body as Node, options)
    .toJSON()
}
