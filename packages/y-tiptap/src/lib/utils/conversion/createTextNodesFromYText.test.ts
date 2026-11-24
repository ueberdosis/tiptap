import { expect, it } from 'vite-plus/test'
import * as Y from 'yjs'
import { schema } from '../../../../tests/utils/testSchema.js'
import { createEmptyMeta } from './createEmptyMeta.js'
import { createTextNodesFromYText } from './createTextNodesFromYText.js'

it.each([{ length: 1, label: 'figure' }, { label: 'figure' }])(
  'reports unsupported embeds in removed text: %j',
  embed => {
    const document = new Y.Doc({ gc: false })
    try {
      const fragment = document.getXmlFragment('prosemirror')
      const paragraph = new Y.XmlElement('paragraph')
      const text = new Y.XmlText()
      fragment.insert(0, [paragraph])
      paragraph.insert(0, [text])
      text.insertEmbed(0, embed)
      const previous = Y.snapshot(document)
      fragment.delete(0, 1)
      const errors: Error[] = []
      const meta = createEmptyMeta()
      meta.reportInvalidContent = error => errors.push(error)

      const nodes = createTextNodesFromYText(text, schema, meta, Y.snapshot(document), previous)

      expect(nodes).toBeNull()
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toBe('Cannot project a Yjs text embed')
    } finally {
      document.destroy()
    }
  },
)

it('preserves live text when a snapshot change callback throws', () => {
  const document = new Y.Doc({ gc: false })
  try {
    const paragraph = new Y.XmlElement('paragraph')
    const text = new Y.XmlText()
    document.getXmlFragment('prosemirror').insert(0, [paragraph])
    paragraph.insert(0, [text])
    text.insert(0, 'a')
    const previous = Y.snapshot(document)
    text.insert(1, 'b')
    const current = Y.snapshot(document)
    const error = new Error('Change callback failed')

    expect(() =>
      createTextNodesFromYText(text, schema, createEmptyMeta(), current, previous, () => {
        throw error
      }),
    ).toThrow(error)
    expect(paragraph.toArray()).toEqual([text])
    expect(text.toString()).toBe('ab')
  } finally {
    document.destroy()
  }
})
