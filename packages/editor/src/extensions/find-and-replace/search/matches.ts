import { RE2JS } from 're2js'

import type { SearchRegex } from './regex.js'

interface TextMatch {
  index: number
  value: string
}

function* findNativeMatches(regex: RegExp, text: string): Generator<TextMatch> {
  for (const match of text.matchAll(regex)) {
    yield { index: match.index, value: match[0] }
  }
}

function* findSafeMatches(regex: RE2JS, text: string): Generator<TextMatch> {
  const matcher = regex.matcher(text)

  while (matcher.find()) {
    yield { index: matcher.start(), value: matcher.group() ?? '' }
  }
}

export function findMatches(regex: SearchRegex, text: string): Generator<TextMatch> {
  return regex instanceof RegExp ? findNativeMatches(regex, text) : findSafeMatches(regex, text)
}
