import { type Fragment, Schema } from '@tiptap/pm/model'
import { describe, expect, it } from 'vite-plus/test'

import { splitSoftBreaks } from './splitSoftBreaks.js'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'inline*' },
    heading: { group: 'block', content: 'inline*' },
    codeBlock: { group: 'block', content: 'text*', code: true },
    blockquote: { group: 'block', content: 'block+' },
    listItem: { content: 'paragraph block*' },
    bulletList: { group: 'block', content: 'listItem+' },
    single: { group: 'block', content: 'paragraph' },
    hardBreak: { group: 'inline', inline: true },
    text: { group: 'inline' },
  },
  marks: { bold: {} },
})

const text = (value: string, bold = false) => ({
  type: 'text',
  text: value,
  ...(bold ? { marks: [{ type: 'bold' }] } : {}),
})

const paragraph = (...content: object[]) => ({ type: 'paragraph', content })

const split = (...blocks: object[]): Fragment =>
  splitSoftBreaks(schema.nodeFromJSON({ type: 'doc', content: blocks }).content)

describe('splitSoftBreaks', () => {
  it('splits a paragraph at a newline', () => {
    expect(split(paragraph(text('a\nb'))).toJSON()).toEqual([
      paragraph(text('a')),
      paragraph(text('b')),
    ])
  })

  it('splits at a carriage return and at several newlines like a plain text paste', () => {
    expect(split(paragraph(text('a\r\nb\n\nc'))).toJSON()).toEqual([
      paragraph(text('a')),
      paragraph(text('b')),
      paragraph(text('c')),
    ])
  })

  it('keeps the marks on every piece', () => {
    expect(split(paragraph(text('x '), text('a\nb', true))).toJSON()).toEqual([
      paragraph(text('x '), text('a', true)),
      paragraph(text('b', true)),
    ])
  })

  it('drops empty pieces at the edges', () => {
    expect(split(paragraph(text('a\n'))).toJSON()).toEqual([paragraph(text('a'))])
  })

  it('leaves a paragraph without a newline as it is', () => {
    expect(split(paragraph(text('a'))).toJSON()).toEqual([paragraph(text('a'))])
  })

  it('keeps an explicit hard break', () => {
    const content = paragraph(text('a'), { type: 'hardBreak' }, text('b'))

    expect(split(content).toJSON()).toEqual([content])
  })

  it('keeps newlines in a code block', () => {
    const code = { type: 'codeBlock', content: [text('a\nb')] }

    expect(split(code).toJSON()).toEqual([code])
  })

  it('keeps a heading as it is', () => {
    const heading = { type: 'heading', content: [text('a')] }

    expect(split(heading).toJSON()).toEqual([heading])
  })

  it('splits paragraphs inside a list item', () => {
    const list = {
      type: 'bulletList',
      content: [{ type: 'listItem', content: [paragraph(text('a\nb'))] }],
    }

    expect(split(list).toJSON()).toEqual([
      {
        type: 'bulletList',
        content: [{ type: 'listItem', content: [paragraph(text('a')), paragraph(text('b'))] }],
      },
    ])
  })

  it('splits paragraphs inside a blockquote', () => {
    expect(split({ type: 'blockquote', content: [paragraph(text('a\nb'))] }).toJSON()).toEqual([
      { type: 'blockquote', content: [paragraph(text('a')), paragraph(text('b'))] },
    ])
  })

  it('keeps the newline when the parent accepts only one paragraph', () => {
    const single = { type: 'single', content: [paragraph(text('a\nb'))] }

    expect(split(single).toJSON()).toEqual([single])
  })
})
