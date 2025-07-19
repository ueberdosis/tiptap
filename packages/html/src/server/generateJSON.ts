import type { Extensions } from '@tiptap/core'
import { getSchema } from '@tiptap/core'
import { type ParseOptions, DOMParser as PMDOMParser } from '@tiptap/pm/model'
import { Window } from 'happy-dom'

/**
 * Generates a JSON object from the given HTML string and converts it into a Prosemirror node with content.
 * @remarks **Important**: This function requires `happy-dom` to be installed in your project.
 * @param {string} html - The HTML string to be converted into a Prosemirror node.
 * @param {Extensions} extensions - The extensions to be used for generating the schema.
 * @param {ParseOptions} options - The options to be supplied to the parser.
 * @returns {Promise<Record<string, any>>} - A promise with the generated JSON object.
 * @example
 * const html = '<p>Hello, world!</p>'
 * const extensions = [...]
 * const json = generateJSON(html, extensions)
 * console.log(json) // { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello, world!' }] }] }
 */
export function generateJSON(html: string, extensions: Extensions, options?: ParseOptions): Record<string, any> {
  if (typeof window !== 'undefined') {
    throw new Error(
      'generateJSON can only be used in a Node environment\nIf you want to use this in a browser environment, use the `@tiptap/html` import instead.',
    )
  }

  const localWindow = new Window()
  const localDOMParser = new localWindow.DOMParser()

  const schema = getSchema(extensions)
  let doc: ReturnType<typeof localDOMParser.parseFromString> | null = null

  const htmlString = `<!DOCTYPE html><html><body>${html}</body></html>`
  doc = localDOMParser.parseFromString(htmlString, 'text/html')

  if (!doc) {
    throw new Error('Failed to parse HTML string')
  }

  return PMDOMParser.fromSchema(schema)
    .parse(doc.body as unknown as Node, options)
    .toJSON()
}
