import { createSearchRegex } from '@tiptap/extension-find-and-replace'
import type { RE2JS } from 're2js'
import { describe, expect, it } from 'vitest'

import { findSafeMatcherMatches } from '../src/search/find-safe-matcher-matches.js'

function createRegex(source: string): RE2JS {
  const regex = createSearchRegex(source, {
    caseSensitive: true,
    useRegex: true,
    wholeWord: false,
  })

  if (!regex) {
    throw new Error(`Could not compile test regex: ${source}`)
  }

  return regex as RE2JS
}

function resultStarts(regex: RE2JS, text: string, resultGroup: number) {
  const starts: number[] = []

  for (const matcher of findSafeMatcherMatches(regex, text, resultGroup)) {
    starts.push(matcher.start(resultGroup))
  }

  return starts
}

describe('findSafeMatcherMatches', () => {
  it('yields a match when the result group participates', () => {
    expect(resultStarts(createRegex('(a)'), 'a', 1)).toEqual([0])
  })

  it('skips matches where the result group does not participate', () => {
    // Group 2 is `(c)`, which does not participate when the text is `a`.
    expect(resultStarts(createRegex('(a)|(c)'), 'a', 2)).toEqual([])
  })

  it('still finds adjacent matches', () => {
    expect(resultStarts(createRegex('(a)'), 'aaa', 1)).toEqual([0, 1, 2])
  })
})
