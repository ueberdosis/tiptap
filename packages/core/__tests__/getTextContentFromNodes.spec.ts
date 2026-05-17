import { getSchemaByResolvedExtensions, getTextContentFromNodes } from '@tiptap/core'
import Document from '@tiptap/editor/nodes/document'
import Mention from '@tiptap/extension-mention'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
import { Node } from '@tiptap/pm/model'
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
