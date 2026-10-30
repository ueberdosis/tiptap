import { describe, expect, it } from 'vite-plus/test'

import {
  continuesNode,
  createContinuedDoc,
  paragraph,
} from '../../tests/utils/createContinuedDoc.js'
import { addContinuedTextblocks } from './addContinuedTextblocks.js'
import type { TextblockRange } from './types.js'

const doc = createContinuedDoc([
  paragraph('one'),
  paragraph('two'),
  paragraph('three', true),
  paragraph('four', true),
  paragraph('five'),
])

function textblockAt(index: number): TextblockRange {
  let pos = 0

  for (let childIndex = 0; childIndex < index; childIndex += 1) {
    pos += doc.child(childIndex).nodeSize
  }

  const node = doc.child(index)

  return { node, pos, from: pos, to: pos + node.nodeSize }
}

function texts(textblocks: TextblockRange[]): string[] {
  return textblocks.map(textblock => textblock.node.textContent)
}

describe('addContinuedTextblocks', () => {
  it('keeps textblocks outside a chain as they are', () => {
    expect(texts(addContinuedTextblocks(doc, [textblockAt(0)], continuesNode))).toEqual(['one'])
    expect(texts(addContinuedTextblocks(doc, [textblockAt(4)], continuesNode))).toEqual(['five'])
  })

  it('adds the textblocks after the first textblock of a chain', () => {
    expect(texts(addContinuedTextblocks(doc, [textblockAt(1)], continuesNode))).toEqual([
      'two',
      'three',
      'four',
    ])
  })

  it('adds the textblocks before and after a continued textblock', () => {
    expect(texts(addContinuedTextblocks(doc, [textblockAt(2)], continuesNode))).toEqual([
      'two',
      'three',
      'four',
    ])
  })

  it('returns every textblock once in document order', () => {
    const textblocks = [textblockAt(0), textblockAt(3), textblockAt(4)]

    expect(texts(addContinuedTextblocks(doc, textblocks, continuesNode))).toEqual([
      'one',
      'two',
      'three',
      'four',
      'five',
    ])
  })

  it('finds continued textblocks in other parents', () => {
    const nested = createContinuedDoc([
      { type: 'blockquote', content: [paragraph('one')] },
      { type: 'blockquote', content: [paragraph('two', true)] },
    ])
    const continued = nested.child(1).child(0)
    const [first] = addContinuedTextblocks(
      nested,
      [{ node: continued, pos: 8, from: 8, to: 8 + continued.nodeSize }],
      continuesNode,
    )

    expect(first).toEqual({ node: nested.child(0).child(0), pos: 1, from: 1, to: 6 })
  })
})
