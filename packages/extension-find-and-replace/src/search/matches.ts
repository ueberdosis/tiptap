import { RE2JS } from 're2js'

import { findSafeMatcherMatches } from './find-safe-matcher-matches.js'
import type { SearchMatcher } from './search-matcher.js'

interface TextMatch {
  index: number
  value: string
}

function* findNativeMatches(regex: RegExp, text: string): Generator<TextMatch> {
  for (const match of text.matchAll(regex)) {
    yield { index: match.index, value: match[0] }
  }
}

function* findSafeMatches(regex: RE2JS, text: string, resultGroup: number): Generator<TextMatch> {
  for (const matcher of findSafeMatcherMatches(regex, text, resultGroup)) {
    yield {
      index: matcher.start(resultGroup),
      value: matcher.group(resultGroup) ?? '',
    }
  }
}

export function findMatches(matcher: SearchMatcher, text: string): Generator<TextMatch> {
  const { regex, resultGroup } = matcher

  return regex instanceof RegExp
    ? findNativeMatches(regex, text)
    : findSafeMatches(regex, text, resultGroup)
}
