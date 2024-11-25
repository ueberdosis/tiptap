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

  it('doesnt cross node boundaries on backward check', () => {
    const testDocument = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'This is a text with a ' },
            { type: 'text', text: 'link.', marks: [{ type: 'link', attrs: { href: 'https://tiptap.dev' } }] },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'This is a text without a link.' },
          ],
        },
      ],
    }

    const doc = Node.fromJSON(schema, testDocument)
    const $pos = doc.resolve(28)
    const range = getMarkRange($pos, schema.marks.link)

    expect(range).to.deep.eq({
      from: 23,
      to: 28,
    })

    const nextRange = getMarkRange(doc.resolve(30), schema.marks.link)

    expect(nextRange).to.eq(undefined)
  })

  it('doesnt cross node boundaries on forward check', () => {
    const testDocument = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'This is a text without a link.' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'A link', marks: [{ type: 'link', attrs: { href: 'https://tiptap.dev' } }] },
            { type: 'text', text: ' is at the start of this paragraph.' },
          ],
        },
      ],
    }
    const doc = Node.fromJSON(schema, testDocument)

    const range = getMarkRange(doc.resolve(32), schema.marks.link)

    expect(range).to.eq(undefined)

    const $pos = doc.resolve(33)
    const nextRange = getMarkRange($pos, schema.marks.link)

    expect(nextRange).to.deep.eq({
      from: 33,
      to: 39,
    })
  })
  it('can distinguish mark boundaries', () => {
    const testDocument = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'This is a text with a ' },
            { type: 'text', text: 'link.', marks: [{ type: 'link', attrs: { href: 'https://tiptap.dev' } }] },
            { type: 'text', text: 'another link', marks: [{ type: 'link', attrs: { href: 'https://tiptap.dev/invalid' } }] },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'This is a text without a link.' },
          ],
        },
      ],
    }

    const doc = Node.fromJSON(schema, testDocument)
    const $pos = doc.resolve(27)
    const range = getMarkRange($pos, schema.marks.link, { href: 'https://tiptap.dev' })

    expect(range).to.deep.eq({
      from: 23,
      to: 28,
    })

    const nextRange = getMarkRange(doc.resolve(28), schema.marks.link)

    expect(nextRange).to.deep.eq({ from: 28, to: 40 })
  })
})
