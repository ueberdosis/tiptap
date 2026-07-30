import type { Matcher, RE2JS } from 're2js'

function advanceStringIndex(text: string, index: number): number {
  return index + 1 + Number((text.codePointAt(index) ?? 0) > 0xffff)
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
 * This lets adjacent matches share the non-word character consumed by the boundary wrapper.
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
