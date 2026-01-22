import { getSchemaByResolvedExtensions, getTextContentFromNodes } from '@dibdab/core'
import Document from '@dibdab/extension-document'
import Mention from '@dibdab/extension-mention'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { Node } from '@dibdab/pm/model'
import { describe, expect, it } from 'vitest'

describe(getTextContentFromNodes.name, () => {
  it('gets text', () => {
    const schema = getSchemaByResolvedExtensions([
      Document,
      Paragraph,
      Text,
      Mention.configure({ renderText: ({ node }) => `@${node.attrs.label ?? 'Unknown'}` }),
    ])

    const doc = Node.fromJSON(schema, {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Start ' },
            { type: 'mention', attrs: { id: 1, label: 'Mention' } },
            { type: 'text', text: ' End' },
          ],
        },
      ],
    })

    const pos = doc.resolve(12)

    const text = getTextContentFromNodes(pos)

    expect(text).toBe('Start @Mention End')
  })
})
