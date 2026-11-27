import { describe, expect, it } from 'vite-plus/test'

import { findRestoredLength, findRewrittenEnd, findRewrittenStart } from './rewrittenText.js'

describe('findRewrittenEnd', () => {
  it.each([
    ['o', 'lo ', 2],
    ['helo', 'hello!', 5],
    ['prose', 'rose', 4],
    ['prose', 'prosee', 5],
    ['teh', 'the!', 3],
    ['a😀', 'a😁b', 3],
  ])('finds the end of %s in %s', (oldText, newText, end) => {
    expect(findRewrittenEnd(oldText, newText)).toBe(end)
  })

  it('returns null when the texts share no characters', () => {
    expect(findRewrittenEnd('ab', 'xy')).toBeNull()
  })
})

describe('findRewrittenStart', () => {
  it.each([
    ['cd', 'abXcd', 3],
    ['aa', 'aaaaa', 3],
    ['😀a', 'b😁a', 1],
  ])('finds the start of %s in %s', (oldText, newText, start) => {
    expect(findRewrittenStart(oldText, newText)).toBe(start)
  })
})

describe('findRestoredLength', () => {
  it.each([
    ['prose', 'prosemirror', 5],
    ['prose', 'x', 0],
    ['a😀', 'a😁', 1],
  ])('counts the characters of %s that %s inserts again', (deletedText, insertedText, length) => {
    expect(findRestoredLength(deletedText, insertedText)).toBe(length)
  })
})
