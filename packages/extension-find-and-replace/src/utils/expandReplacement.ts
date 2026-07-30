import type { SearchRegex } from '../search/regex.js'
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

const replacementTokenRegex = /\$(\$|&|0[1-9]|[1-9]\d?|<[^>]*>)/g
const replacementTokenPattern = /\$(?:\$|&|0[1-9]|[1-9]\d?|<[^>]*>)/

type SafeMatcher = ReturnType<Exclude<SearchRegex, RegExp>['matcher']>

/**
 * Checks whether a replacement contains a supported substitution token.
 * @param replacement The replacement template.
 * @returns Whether the template needs capture expansion.
 */
export function hasReplacementTokens(replacement: string): boolean {
  return replacementTokenPattern.test(replacement)
}

function advanceStringIndex(text: string, index: number, unicode: boolean): number {
  if (!unicode) {
    return index + 1
  }

  return index + 1 + Number((text.codePointAt(index) ?? 0) > 0xffff)
}

function canContinueNativeMatches(regex: RegExp): boolean {
  return regex.global || regex.sticky
}

function advanceAfterEmptyMatch(regex: RegExp, text: string, value: string): void {
  if (value.length === 0) {
    regex.lastIndex = advanceStringIndex(text, regex.lastIndex, regex.unicode)
  }
}

function locateNativeMatch(match: RegExpExecArray): LocatedReplacementMatch {
  return {
    captures: match.slice(1),
    from: match.index,
    namedCaptures: match.groups ? new Map(Object.entries(match.groups)) : null,
    to: match.index + match[0].length,
    value: match[0],
  }
}

function* nativeMatches(regex: RegExp, text: string): Generator<LocatedReplacementMatch> {
  const matcher = new RegExp(regex.source, regex.flags)
  let match = matcher.exec(text)

  while (match) {
    yield locateNativeMatch(match)

    if (!canContinueNativeMatches(matcher)) {
      return
    }

    advanceAfterEmptyMatch(matcher, text, match[0])
    match = matcher.exec(text)
  }
}

function safeNamedCaptures(
  regex: Exclude<SearchRegex, RegExp>,
  matcher: SafeMatcher,
): ReadonlyMap<string, string | null> | null {
  const groupNames = Object.keys(regex.namedGroups())

  if (groupNames.length === 0) {
    return null
  }

  return new Map(groupNames.map(name => [name, matcher.group(name)] as const))
}

function safeMatchValue(matcher: SafeMatcher, resultGroup: number): string {
  return matcher.group(resultGroup) ?? ''
}

function* safeMatches(
  regex: Exclude<SearchRegex, RegExp>,
  text: string,
  resultGroup: number,
): Generator<LocatedReplacementMatch> {
  for (const matcher of findSafeMatcherMatches(regex, text, resultGroup)) {
    const value = safeMatchValue(matcher, resultGroup)
    const from = matcher.start(resultGroup)
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

function replacementMatches(
  regex: SearchRegex,
  text: string,
  resultGroup: number,
): Generator<LocatedReplacementMatch> {
  return regex instanceof RegExp
    ? nativeMatches(regex, text)
    : safeMatches(regex, text, resultGroup)
}

function hasLocation(match: LocatedReplacementMatch, from: number, to: number): boolean {
  return match.from === from && match.to === to
}

function findReplacementMatch(
  regex: SearchRegex,
  text: string,
  from: number,
  to: number,
  resultGroup: number,
): ReplacementMatch | null {
  for (const match of replacementMatches(regex, text, resultGroup)) {
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
 * @param regex The compiled search matcher.
 * @param text The complete searchable textblock text.
 * @param replacement The replacement template.
 * @returns An expander addressed by match offsets in `text`.
 */
export function createReplacementExpander(
  regex: SearchRegex,
  text: string,
  replacement: string,
  resultGroup = 0,
): ReplacementExpander {
  const matches = new Map<string, ReplacementMatch>()

  for (const match of replacementMatches(regex, text, resultGroup)) {
    matches.set(matchKey(match.from, match.to), match)
  }

  return (from, to) => expandMatch(matches.get(matchKey(from, to)) ?? null, replacement)
}

/**
 * Expands JavaScript-style replacement tokens for one complete regex match.
 * @param regex The compiled search matcher.
 * @param text The text containing the match.
 * @param replacement The replacement template.
 * @param from The match start offset in `text`.
 * @param to The match end offset in `text`.
 * @returns The expanded replacement, or the unchanged template when the text no longer matches.
 */
export function expandReplacement(
  regex: SearchRegex,
  text: string,
  replacement: string,
  from = 0,
  to = text.length,
  resultGroup = 0,
): string {
  return expandMatch(findReplacementMatch(regex, text, from, to, resultGroup), replacement)
}
