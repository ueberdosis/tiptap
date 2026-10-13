import { Schema } from '@tiptap/pm/model'
import { describe, expect, it } from 'vite-plus/test'

import { findSuggestionMatch } from './findSuggestionMatch.js'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'inline*' },
    text: { group: 'inline' },
  },
})

function positionAtEnd(text: string) {
  const doc = schema.node('doc', null, [schema.node('paragraph', null, [schema.text(text)])])

  return doc.resolve(text.length + 1)
}

function findMatch(text: string, allowedPrefixes: string[] | null) {
  return findSuggestionMatch({
    char: '@',
    allowSpaces: false,
    allowToIncludeChar: false,
    allowedPrefixes,
    startOfLine: false,
    $position: positionAtEnd(text),
  })
}

const mention = {
  range: { from: 4, to: 8 },
  query: 'bob',
  text: '@bob',
}

describe('findSuggestionMatch allowedPrefixes', () => {
  it('matches after a hyphen when a hyphen is an allowed prefix', () => {
    expect(findMatch('hi-@bob', [' ', '-'])).toEqual(mention)
  })

  it('matches after a closing bracket when it is an allowed prefix', () => {
    expect(findMatch('hi]@bob', [' ', ']'])).toEqual(mention)
  })

  it('matches after a space when only a space is allowed', () => {
    expect(findMatch('hi @bob', [' '])).toEqual(mention)
  })

  it('returns null when the prefix is not allowed', () => {
    expect(findMatch('hi.@bob', [' '])).toBeNull()
  })

  it('treats a caret prefix as a literal', () => {
    expect(findMatch('hi^@bob', ['^'])).toEqual(mention)
    expect(findMatch('hi @bob', ['^'])).toBeNull()
  })

  it('treats a backslash prefix as a literal', () => {
    expect(findMatch('hi\\@bob', ['\\'])).toEqual(mention)
  })
})
