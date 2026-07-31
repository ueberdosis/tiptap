import type { Matcher, RE2JS } from 're2js'

function advanceStringIndex(text: string, index: number): number {
  // JS uses UTF-16; code points through 0xffff (65,535) use one code unit.
  // For example, '😀' is larger and uses two code units, while 'A' uses one.
  const codePoint = text.codePointAt(index) ?? 0
  const codeUnitCount = codePoint > 0xffff ? 2 : 1

  return index + codeUnitCount
}

function* findFullMatches(regex: RE2JS, text: string): Generator<Matcher> {
  const matcher = regex.matcher(text)

  while (matcher.find()) {
    yield matcher
  }
}

function nextSearchIndex(text: string, matcher: Matcher, resultGroup: number): number {
  const from = matcher.start(resultGroup)
  const to = matcher.end(resultGroup)

  // Empty captures do not advance, so move by one code point to avoid matching forever.
  return to > from ? to : advanceStringIndex(text, from)
}

function* findCapturedMatches(regex: RE2JS, text: string, resultGroup: number): Generator<Matcher> {
  const matcher = regex.matcher(text)
  let searchFrom = 0

  while (searchFrom <= text.length) {
    if (!matcher.find(searchFrom)) {
      return
    }

    yield matcher
    searchFrom = nextSearchIndex(text, matcher, resultGroup)
  }
}

/**
 * Iterates RE2 matches, restarting at the captured result end when a wrapper group is used.
 * This lets adjacent matches reuse the non-word character between them, such as in "cat cat".
 */
export function findSafeMatcherMatches(
  regex: RE2JS,
  text: string,
  resultGroup: number,
): Generator<Matcher> {
  return resultGroup === 0
    ? findFullMatches(regex, text)
    : findCapturedMatches(regex, text, resultGroup)
}
