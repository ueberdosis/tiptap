import { Transform } from '@tiptap/pm/transform'
import { describe, expect, it } from 'vite-plus/test'

import { createContinuedDoc, paragraph } from '../../tests/utils/createContinuedDoc.js'
import { getChangedTextblocks } from './getChangedTextblocks.js'

describe('getChangedTextblocks', () => {
  const doc = createContinuedDoc([paragraph('one'), paragraph('two'), paragraph('three')])

  it('finds the textblocks around a text change', () => {
    const transform = new Transform(doc).insert(7, doc.type.schema.text('x'))
    const textblocks = getChangedTextblocks(transform.doc, transform)

    expect(textblocks.map(textblock => textblock.node.textContent)).toEqual(['txwo'])
  })

  it('finds a textblock whose attributes changed and the one before it', () => {
    const transform = new Transform(doc).setNodeAttribute(5, 'continued', true)
    const textblocks = getChangedTextblocks(transform.doc, transform)

    expect(textblocks).toEqual([
      { node: transform.doc.child(0), pos: 0, from: 0, to: 5 },
      { node: transform.doc.child(1), pos: 5, from: 5, to: 10 },
    ])
  })
})
