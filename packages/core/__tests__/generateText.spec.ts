import type { NodeConfig } from '@dibdab/core'
import { generateText, Node } from '@dibdab/core'
import Document from '@dibdab/extension-document'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { describe, expect, it } from 'vitest'

describe(generateText.name, () => {
  it('generates Text from JSON without an editor instance', () => {
    const json = {
      type: 'doc',
      content: [
        {
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
        },
      ],
    }

    const contentfulInlineNode = (name: string, config?: Partial<NodeConfig>) =>
      Node.create({
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

    expect(text).toBe('Example One ~Example Two~')
  })
})
