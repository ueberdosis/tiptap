import { Node } from '@tiptap/core'

/**
 * Decode common HTML entities so the editor displays the literal characters.
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
}

/**
 * This extension allows you to create text nodes.
 * @see https://www.tiptap.dev/api/nodes/text
 */
export const Text = Node.create({
  name: 'text',
  group: 'inline',

  parseMarkdown: token => {
    // Convert 'text' token to text node - text nodes are special as they store text directly
    // Decode HTML entities so that e.g. `&lt;` displays as `<` in the editor
    return {
      type: 'text',
      text: decodeHtmlEntities(token.text || ''),
    }
  },

  renderMarkdown: node => node.text || '',
})
