/// <reference types="cypress" />

import {
  getMarkRange,
  getSchemaByResolvedExtensions,
} from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Link from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Node } from '@tiptap/pm/model'

describe('getMarkRange', () => {
  const document = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'This is a ' },
          { type: 'text', text: 'linked', marks: [{ type: 'link', attrs: { href: 'https://tiptap.dev' } }] },
          { type: 'text', text: ' text.' },
        ],
      },
    ],
  }

  const schema = getSchemaByResolvedExtensions([
    Document,
    Paragraph,
    Text,
    Link.configure({ openOnClick: false }),
  ])

  it('gets the correct range for a position inside the mark', () => {
    const doc = Node.fromJSON(schema, document)
    const $pos = doc.resolve(14)
    const range = getMarkRange($pos, schema.marks.link)

    expect(range).to.deep.eq({
      from: 11,
      to: 17,
    })

    // eslint-disable-next-line no-console
    console.log(range)
  })

  it('gets the correct range for a position at the start of the mark', () => {
    const doc = Node.fromJSON(schema, document)
    const $pos = doc.resolve(11)
    const range = getMarkRange($pos, schema.marks.link)

    expect(range).to.deep.eq({
      from: 11,
      to: 17,
    })
  })

  it('gets the correct range for a position at the end of the mark', () => {
    const doc = Node.fromJSON(schema, document)
    const $pos = doc.resolve(17)
    const range = getMarkRange($pos, schema.marks.link)

    expect(range).to.deep.eq({
      from: 11,
      to: 17,
    })
  })

  it('gets undefined if a mark is not found', () => {
    const doc = Node.fromJSON(schema, document)
    const $pos = doc.resolve(6)
    const range = getMarkRange($pos, schema.marks.link)

    expect(range).to.eq(undefined)
  })
})
