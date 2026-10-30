import { describe, expect, it } from 'vite-plus/test'

import {
  continuesNode,
  createContinuedDoc,
  paragraph,
} from '../../tests/utils/createContinuedDoc.js'
import { searchDocument } from './search.js'

const options = { caseSensitive: false, useRegex: false, wholeWord: false }

describe('searchDocument with continued textblocks', () => {
  const doc = createContinuedDoc([
    paragraph('find the '),
    paragraph('phrase here', true),
    paragraph('the'),
  ])

  it('does not join textblocks by default', () => {
    expect(searchDocument(doc, 'the phrase', options)).toEqual([])
  })

  it('finds a match that runs into the continued textblock', () => {
    expect(searchDocument(doc, 'the phrase', { ...options, continuesNode })).toEqual([
      { from: 6, to: 18 },
    ])
  })

  it('keeps a match that ends or starts at the boundary in its own textblock', () => {
    expect(searchDocument(doc, 'the ', { ...options, continuesNode })).toEqual([
      { from: 6, to: 10 },
    ])
    expect(searchDocument(doc, 'phrase', { ...options, continuesNode })).toEqual([
      { from: 12, to: 18 },
    ])
  })

  it('does not join a textblock that does not continue', () => {
    expect(searchDocument(doc, 'herethe', { ...options, continuesNode })).toEqual([])
  })

  it('joins a chain of continued textblocks', () => {
    const chain = createContinuedDoc([
      paragraph('a lo'),
      paragraph('n', true),
      paragraph('g word', true),
    ])

    expect(searchDocument(chain, 'long', { ...options, continuesNode })).toEqual([
      { from: 3, to: 11 },
    ])
  })

  it('matches whole words across the boundary', () => {
    const split = createContinuedDoc([paragraph('hel'), paragraph('lo hello', true)])
    const results = searchDocument(split, 'hello', { ...options, wholeWord: true, continuesNode })

    expect(results).toEqual([
      { from: 1, to: 8 },
      { from: 9, to: 14 },
    ])
  })

  it('does not match across a hard break at the start of a continued textblock', () => {
    const split = createContinuedDoc([
      paragraph('one'),
      {
        type: 'paragraph',
        attrs: { continued: true },
        content: [{ type: 'hardBreak' }, { type: 'text', text: 'two' }],
      },
    ])

    expect(searchDocument(split, 'onetwo', { ...options, continuesNode })).toEqual([])
    expect(searchDocument(split, 'two', { ...options, continuesNode })).toEqual([
      { from: 7, to: 10 },
    ])
  })
})
