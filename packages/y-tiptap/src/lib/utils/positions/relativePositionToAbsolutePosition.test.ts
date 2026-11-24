import { Schema } from 'prosemirror-model'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import * as Y from 'yjs'

import { createEmptyMeta } from '../conversion/createEmptyMeta.js'
import { updateYFragment } from '../reconciliation/updateYFragment.js'
import { absolutePositionToRelativePosition } from './absolutePositionToRelativePosition.js'
import { relativePositionToAbsolutePosition } from './relativePositionToAbsolutePosition.js'

const schema = new Schema({
  nodes: {
    doc: { content: 'block*' },
    paragraph: { group: 'block', content: 'text*' },
    blockquote: { group: 'block', content: 'block*' },
    text: {},
  },
})

const paragraph = (text: string) => schema.node('paragraph', null, text ? schema.text(text) : [])
const content = schema.node('doc', null, [
  paragraph('First'),
  schema.node('blockquote', null, [paragraph('Nested'), paragraph('')]),
  paragraph('Last'),
])

describe('relativePositionToAbsolutePosition', () => {
  const documents: Y.Doc[] = []

  afterEach(() => {
    documents.forEach(document => document.destroy())
    documents.length = 0
  })

  const createDocument = () => {
    const document = new Y.Doc()
    documents.push(document)

    return document
  }

  it.each(Array.from({ length: content.content.size + 1 }, (_, position) => position))(
    'resolves position %i across nested blocks and empty paragraphs',
    position => {
      const document = createDocument()
      const fragment = document.getXmlFragment('prosemirror')
      const meta = createEmptyMeta()
      updateYFragment(document, fragment, content, meta)
      const relative = absolutePositionToRelativePosition(position, fragment, meta.mapping)

      expect(relativePositionToAbsolutePosition(document, fragment, relative, meta.mapping)).toBe(
        position,
      )
    },
  )

  it('ignores deleted siblings when resolving a later paragraph', () => {
    const document = createDocument()
    const fragment = document.getXmlFragment('prosemirror')
    const meta = createEmptyMeta()
    updateYFragment(
      document,
      fragment,
      schema.node('doc', null, [paragraph('First'), paragraph('Second')]),
      meta,
    )
    const relative = absolutePositionToRelativePosition(8, fragment, meta.mapping)

    fragment.delete(0, 1)

    expect(relativePositionToAbsolutePosition(document, fragment, relative, meta.mapping)).toBe(1)
  })

  it('returns null for a position from a different shared fragment', () => {
    const document = createDocument()
    const fragment = document.getXmlFragment('prosemirror')
    const other = document.getXmlFragment('other')
    const relative = Y.createRelativePositionFromTypeIndex(other, 0)

    expect(relativePositionToAbsolutePosition(document, fragment, relative, new Map())).toBeNull()
  })

  it('returns null when a preceding block has no ProseMirror mapping', () => {
    const document = createDocument()
    const fragment = document.getXmlFragment('prosemirror')
    const meta = createEmptyMeta()
    updateYFragment(document, fragment, content, meta)
    const relative = absolutePositionToRelativePosition(9, fragment, meta.mapping)
    meta.mapping.delete(fragment.get(0))

    expect(
      relativePositionToAbsolutePosition(document, fragment, relative, meta.mapping),
    ).toBeNull()
  })
})
