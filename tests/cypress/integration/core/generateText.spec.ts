/// <reference types="cypress" />

import { generateText, Node, NodeConfig } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

describe(generateText.name, () => {
  it('generates Text from JSON without an editor instance', () => {
    const json = {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [
          {
            type: 'custom-node-default-renderer',
            content: [
              {
                type: 'text',
                text: 'Example One',
              },
            ],
          },
          {
            type: 'text',
            text: ' ',
          },
          {
            type: 'custom-node-custom-renderer',
            content: [
              {
                type: 'text',
                text: 'Example Two',
              },
            ],
          },
        ],
      }],
    }

    const contentfulInlineNode = (name: string, config?: Partial<NodeConfig>) => Node.create({
      name,
      group: 'inline',
      inline: true,
      content: 'text*',
      parseHTML() {
        return [{ tag: name }]
      },
      ...config,
    })

    const text = generateText(json, [
      Document,
      Paragraph,
      Text,
      contentfulInlineNode('custom-node-default-renderer'),
      contentfulInlineNode('custom-node-custom-renderer', {
        renderText({ node }) {
          return `~${node.textContent}~`
        },
      }),
    ])

    expect(text).to.eq('Example One ~Example Two~')
  })
})
