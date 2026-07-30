import { getSchemaByResolvedExtensions, Node, repairNode } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import type { JSONContent } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

// A block node that can only live inside the doc node, like an image or a horizontal rule.
const BlockLeaf = Node.create({
  name: 'blockLeaf',
  group: 'block',
  atom: true,
  parseHTML: () => [{ tag: 'hr' }],
  renderHTML: () => ['hr'],
})

const schema = getSchemaByResolvedExtensions([Document, Paragraph, Text, Bold, BlockLeaf])

/**
 * Repairs the JSON content and makes sure the result matches the schema.
 */
function repairJSON(json: JSONContent) {
  const repaired = repairNode(schema.nodeFromJSON(json))

  expect(() => repaired?.check()).not.toThrow()

  return repaired
}

const paragraphWithText = (text: string) => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
})

describe('repairNode', () => {
  it('returns the same node for valid content', () => {
    const node = schema.nodeFromJSON({
      type: 'doc',
      content: [paragraphWithText('Example Text')],
    })

    expect(repairNode(node)).toBe(node)
  })

  it('unwraps a doc nested inside the doc node', () => {
    const repaired = repairJSON({
      type: 'doc',
      content: [{ type: 'doc', content: [paragraphWithText('PoC')] }],
    })

    expect(repaired?.toJSON()).toEqual({
      type: 'doc',
      content: [paragraphWithText('PoC')],
    })
  })

  it('unwraps repeatedly nested doc nodes', () => {
    const repaired = repairJSON({
      type: 'doc',
      content: [
        {
          type: 'doc',
          content: [{ type: 'doc', content: [paragraphWithText('PoC')] }],
        },
      ],
    })

    expect(repaired?.toJSON()).toEqual({
      type: 'doc',
      content: [paragraphWithText('PoC')],
    })
  })

  it('unwraps a paragraph nested inside a paragraph', () => {
    const repaired = repairJSON({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [paragraphWithText('Example Text')],
        },
      ],
    })

    expect(repaired?.toJSON()).toEqual({
      type: 'doc',
      content: [paragraphWithText('Example Text')],
    })
  })

  it('wraps text placed directly inside the doc node', () => {
    const repaired = repairJSON({
      type: 'doc',
      content: [{ type: 'text', text: 'Example Text' }],
    })

    expect(repaired?.toJSON()).toEqual({
      type: 'doc',
      content: [paragraphWithText('Example Text')],
    })
  })

  it('moves a block node out of a paragraph instead of dropping it', () => {
    const repaired = repairJSON({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'blockLeaf' }],
        },
      ],
    })

    expect(repaired?.toJSON()).toEqual({
      type: 'doc',
      content: [{ type: 'blockLeaf' }],
    })
  })

  it('keeps the text of a paragraph a block node is moved out of', () => {
    const repaired = repairJSON({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Example Text' }, { type: 'blockLeaf' }],
        },
      ],
    })

    expect(repaired?.toJSON()).toEqual({
      type: 'doc',
      content: [paragraphWithText('Example Text'), { type: 'blockLeaf' }],
    })
  })

  it('adds required children to an empty doc node', () => {
    const repaired = repairJSON({ type: 'doc' })

    expect(repaired?.toJSON()).toEqual({
      type: 'doc',
      content: [{ type: 'paragraph' }],
    })
  })

  it('removes duplicated marks', () => {
    const repaired = repairJSON({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
              marks: [{ type: 'bold' }, { type: 'bold' }],
            },
          ],
        },
      ],
    })

    expect(repaired?.toJSON()).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
              marks: [{ type: 'bold' }],
            },
          ],
        },
      ],
    })
  })

  it('removes marks the parent node does not allow', () => {
    const schemaWithoutMarks = getSchemaByResolvedExtensions([
      Document,
      Paragraph.extend({ marks: '' }),
      Text,
      Bold,
    ])

    const repaired = repairNode(
      schemaWithoutMarks.nodeFromJSON({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Example Text', marks: [{ type: 'bold' }] }],
          },
        ],
      }),
    )

    expect(() => repaired?.check()).not.toThrow()
    expect(repaired?.toJSON()).toEqual({
      type: 'doc',
      content: [paragraphWithText('Example Text')],
    })
  })
})
