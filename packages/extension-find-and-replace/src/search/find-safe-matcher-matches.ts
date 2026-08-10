import type { Matcher, RE2JS } from 're2js'

function advanceStringIndex(text: string, index: number): number {
  // Some characters like emojis take two string positions in JS, while most take one.
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

  // Empty matches do not advance, so move one character forward to avoid looping forever.
  return to > from ? to : advanceStringIndex(text, from)
}

function* findCapturedMatches(regex: RE2JS, text: string, resultGroup: number): Generator<Matcher> {
  const matcher = regex.matcher(text)
  let searchFrom = 0

  while (searchFrom <= text.length) {
    if (!matcher.find(searchFrom)) {
      return
    }

    // The result group matched nothing here, e.g. the other branch of `(a)|(b)` matched.
    // Skip the whole match so we never return a wrong result or loop forever.
    const from = matcher.start(resultGroup)
    if (from < 0) {
      searchFrom = advanceStringIndex(text, matcher.end(0))
      continue
    }

    yield matcher
    searchFrom = nextSearchIndex(text, matcher, resultGroup)
  }
}

/** Finds all regex matches, even when they are next to each other. */
export function findSafeMatcherMatches(
  regex: RE2JS,
  text: string,
  resultGroup: number,
): Generator<Matcher> {
  return resultGroup === 0
    ? findFullMatches(regex, text)
    : findCapturedMatches(regex, text, resultGroup)
}
