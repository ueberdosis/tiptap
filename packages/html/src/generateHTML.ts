import {
  Extensions, generateHTML as coreGenerateHTML, JSONContent,
} from '@tiptap/core'

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
  return coreGenerateHTML(doc, extensions)
}
