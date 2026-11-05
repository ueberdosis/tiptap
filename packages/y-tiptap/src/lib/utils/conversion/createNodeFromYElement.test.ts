import { expect, it } from 'vite-plus/test'
import * as Y from 'yjs'
import { schema } from '../../../../tests/utils/testSchema.js'
import { createEmptyMeta } from './createEmptyMeta.js'
import { createNodeFromYElement } from './createNodeFromYElement.js'

it('converts text with many formatting runs', () => {
  const document = new Y.Doc()
  try {
    const paragraph = new Y.XmlElement('paragraph')
    const text = new Y.XmlText()
    document.getXmlFragment('prosemirror').insert(0, [paragraph])
    paragraph.insert(0, [text])
    text.applyDelta(
      Array.from({ length: 150_000 }, (_, index) => ({
        insert: 'a',
        attributes: index % 2 === 0 ? { strong: {} } : {},
      })),
    )

    const node = createNodeFromYElement(paragraph, schema, createEmptyMeta())

    expect(node?.childCount).toBe(150_000)
  } finally {
    document.destroy()
  }
})

it('does not merge shared text while projecting a snapshot', () => {
  const document = new Y.Doc({ gc: false })
  try {
    const paragraph = new Y.XmlElement('paragraph')
    document.getXmlFragment('prosemirror').insert(0, [paragraph])
    paragraph.insert(0, [new Y.XmlText('Hello'), new Y.XmlText(' world')])
    const snapshot = Y.snapshot(document)
    const before = Y.encodeStateAsUpdate(document)

    const node = createNodeFromYElement(paragraph, schema, createEmptyMeta(), snapshot, snapshot)

    expect(node?.textContent).toBe('Hello world')
    expect(paragraph.length).toBe(2)
    expect(Y.encodeStateAsUpdate(document)).toEqual(before)
  } finally {
    document.destroy()
  }
})
