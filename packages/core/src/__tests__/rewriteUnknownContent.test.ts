import { Schema } from '@tiptap/pm/model'
import { describe, expect, it } from 'vitest'

import { rewriteUnknownContent } from '../helpers/rewriteUnknownContent.js'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'inline*' },
    text: { group: 'inline' },
  },
  marks: { bold: {} },
})

describe('rewriteUnknownContent', () => {
  it('drops nullish entries in a marks array without throwing', () => {
    const json = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hi', marks: [null] }] }],
    }

    const result = rewriteUnknownContent(json as any, schema)

    expect(result.json).toEqual({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hi', marks: [] }] }],
    })
  })

  it('drops nullish entries in a content array without throwing', () => {
    const json = { type: 'doc', content: [null] }

    const result = rewriteUnknownContent(json as any, schema)

    expect(result.json).toEqual({ type: 'doc', content: [] })
  })

  it('still keeps valid marks and content', () => {
    const json = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hi', marks: [{ type: 'bold' }] }] }],
    }

    const result = rewriteUnknownContent(json as any, schema)

    expect(result.json).toEqual(json)
    expect(result.rewrittenContent).toHaveLength(0)
  })
})
