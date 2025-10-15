import { Node } from '@tiptap/core'

/**
 * This extension allows you to create text nodes.
 * @see https://www.tiptap.dev/api/nodes/text
 */
export const Text = Node.create({
  name: 'text',
  group: 'inline',

  parseMarkdown: token => {
    // Convert 'text' token to text node - text nodes are special as they store text directly
    return {
      type: 'text',
      text: token.text || '',
    }
  },

  renderMarkdown: node => node.text || '',
})
