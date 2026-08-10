import type { Matcher, RE2JS } from 're2js'

import { findSafeMatcherMatches } from '../search/find-safe-matcher-matches.js'

interface ReplacementMatch {
  captures: readonly (string | null | undefined)[]
  namedCaptures: ReadonlyMap<string, string | null | undefined> | null
  value: string
}

interface LocatedReplacementMatch extends ReplacementMatch {
  from: number
  to: number
}

// The expansion regex scans globally and captures the part after `$` in tokens like `$1` and `$<name>`.
// Detection stays non-global because repeated `test()` calls would mutate `lastIndex`.
const replacementTokenRegex = /\$(\$|&|0[1-9]|[1-9]\d?|<[^>]*>)/g
const replacementTokenPattern = /\$(?:\$|&|0[1-9]|[1-9]\d?|<[^>]*>)/

/**
 * Checks whether a replacement contains a supported substitution token.
 * @param replacement The replacement template.
 * @returns Whether the template needs capture expansion.
 */
export function hasReplacementTokens(replacement: string): boolean {
  return replacementTokenPattern.test(replacement)
}

function safeNamedCaptures(
  regex: RE2JS,
  matcher: Matcher,
): ReadonlyMap<string, string | null> | null {
  const groupNames = Object.keys(regex.namedGroups())

  if (groupNames.length === 0) {
    // `null` keeps `$<name>` literal when the regex defines no named groups.
    return null
  }

  return new Map(groupNames.map(name => [name, matcher.group(name)] as const))
}

function safeMatchValue(matcher: Matcher, resultGroup: number): string {
  return matcher.group(resultGroup) ?? ''
}

function* safeMatches(
  regex: RE2JS,
  text: string,
  resultGroup: number,
): Generator<LocatedReplacementMatch> {
  for (const matcher of findSafeMatcherMatches(regex, text, resultGroup)) {
    const value = safeMatchValue(matcher, resultGroup)
    const from = matcher.start(resultGroup)
    // Whole-word matching wraps the result, shifting each user capture by one group.
    // Start after `resultGroup` so replacement `$1` still means the user's first capture.
    const captureCount = matcher.groupCount() - resultGroup

    yield {
      captures: Array.from({ length: captureCount }, (_, index) =>
        matcher.group(resultGroup + index + 1),
      ),
      from,
      namedCaptures: safeNamedCaptures(regex, matcher),
      to: matcher.end(resultGroup),
      value,
    }
  }
}

function hasLocation(match: LocatedReplacementMatch, from: number, to: number): boolean {
  return match.from === from && match.to === to
}

function findReplacementMatch(
  regex: RE2JS,
  text: string,
  from: number,
  to: number,
  resultGroup: number,
): ReplacementMatch | null {
  // Match the full text so `^`, `$`, and boundary assertions retain their original context.
  for (const match of safeMatches(regex, text, resultGroup)) {
    if (hasLocation(match, from, to)) {
      return match
    }

    if (match.from > from) {
      return null
    }
  }

  return null
}

function hasCapture(captures: ReplacementMatch['captures'], group: number): boolean {
  return group > 0 && group <= captures.length
}

function captureValue(captures: ReplacementMatch['captures'], group: number): string {
  return captures[group - 1] ?? ''
}

function expandNumericCapture(
  token: string,
  reference: string,
  captures: ReplacementMatch['captures'],
): string {
  const group = Number(reference)

  if (hasCapture(captures, group)) {
    return captureValue(captures, group)
  }

  if (reference.length !== 2) {
    return token
  }

  // Match `String.prototype.replace`: if group 12 is missing but group 1 exists, use `$1` plus `2`.
  const firstGroup = Number(reference[0])

  if (!hasCapture(captures, firstGroup)) {
    return token
  }

  return `${captureValue(captures, firstGroup)}${reference[1]}`
}

function expandNamedCapture(
  token: string,
  reference: string,
  namedCaptures: ReplacementMatch['namedCaptures'],
): string {
  if (!namedCaptures) {
    return token
  }

  return namedCaptures.get(reference.slice(1, -1)) ?? ''
}

function expandToken(match: ReplacementMatch, token: string, reference: string): string {
  if (reference === '$') {
    return '$'
  }

  if (reference === '&') {
    return match.value
  }

  return reference.startsWith('<')
    ? expandNamedCapture(token, reference, match.namedCaptures)
    : expandNumericCapture(token, reference, match.captures)
}

function expandMatch(match: ReplacementMatch | null, replacement: string): string {
  if (!match) {
    return replacement
  }

  return replacement.replace(replacementTokenRegex, (token, reference: string) =>
    expandToken(match, token, reference),
  )
}

function matchKey(from: number, to: number): string {
  return `${from}:${to}`
}

export type ReplacementExpander = (from: number, to: number) => string

/**
 * Indexes every regex match once and creates a replacement expander for a textblock.
 * @param regex The compiled RE2 search matcher.
 * @param text The complete searchable textblock text.
 * @param replacement The replacement template.
 * @param resultGroup The matcher group containing the reported result; later groups are captures.
 * @returns An expander addressed by match offsets in `text`.
 */
export function createReplacementExpander(
  regex: RE2JS,
  text: string,
  replacement: string,
  resultGroup = 0,
): ReplacementExpander {
  const matches = new Map<string, ReplacementMatch>()

  for (const match of safeMatches(regex, text, resultGroup)) {
    matches.set(matchKey(match.from, match.to), match)
  }

  return (from, to) => expandMatch(matches.get(matchKey(from, to)) ?? null, replacement)
}

/**
 * Expands JavaScript-style replacement tokens for one complete regex match.
 * @param regex The compiled RE2 search matcher.
 * @param text The text containing the match.
 * @param replacement The replacement template.
 * @param from The match start offset in `text`.
 * @param to The match end offset in `text`.
 * @param resultGroup The matcher group containing the reported result; later groups are captures.
 * @returns The expanded replacement, or the unchanged template when the text no longer matches.
 */
export function expandReplacement(
  regex: RE2JS,
  text: string,
  replacement: string,
  from = 0,
  to = text.length,
  resultGroup = 0,
): string {
  return expandMatch(findReplacementMatch(regex, text, from, to, resultGroup), replacement)
}
