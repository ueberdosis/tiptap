import { Schema } from 'prosemirror-model'
import { describe, expect, it } from 'vite-plus/test'
import * as Y from 'yjs'
import { createEmptyMeta } from '../conversion/createEmptyMeta.js'
import { findMappedChildAnchors } from './findMappedChildAnchors.js'

const schema = new Schema({
  nodes: {
    doc: { content: 'block*' },
    paragraph: { group: 'block', content: 'text*' },
    text: {},
  },
})

describe('findMappedChildAnchors', () => {
  it('skips a text type that shares its run with siblings', () => {
    const meta = createEmptyMeta()
    const textA = new Y.XmlText()
    const textB = new Y.XmlText()
    const element1 = new Y.XmlElement('paragraph')
    const element2 = new Y.XmlElement('paragraph')
    const textNodes = [schema.text('hello')]
    const node1 = schema.node('paragraph', null, schema.text('one'))
    const node2 = schema.node('paragraph', null, schema.text('two'))

    meta.mapping.set(textA, textNodes)
    meta.mapping.set(element1, node1)
    meta.mapping.set(element2, node2)

    const anchors = findMappedChildAnchors(
      [textA, textB, element1, element2],
      [textNodes, node2, node1],
      meta,
    )

    expect(anchors).toEqual([{ yIndex: 3, pIndex: 1, yChild: element2 }])
  })

  it('keeps a lone text type as an anchor', () => {
    const meta = createEmptyMeta()
    const textA = new Y.XmlText()
    const element1 = new Y.XmlElement('paragraph')
    const element2 = new Y.XmlElement('paragraph')
    const textNodes = [schema.text('hello')]
    const node1 = schema.node('paragraph', null, schema.text('one'))
    const node2 = schema.node('paragraph', null, schema.text('two'))

    meta.mapping.set(textA, textNodes)
    meta.mapping.set(element1, node1)
    meta.mapping.set(element2, node2)

    const anchors = findMappedChildAnchors(
      [textA, element1, element2],
      [textNodes, node2, node1],
      meta,
    )

    expect(anchors).toEqual([
      { yIndex: 0, pIndex: 0, yChild: textA },
      { yIndex: 2, pIndex: 1, yChild: element2 },
    ])
  })
})
