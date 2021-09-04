import { Range } from '@tiptap/core'
import { ResolvedPos } from 'prosemirror-model'

export interface Trigger {
  char: string | string[],
  allowSpaces: boolean,
  startOfLine: boolean,
  $position: ResolvedPos,
}

export type SuggestionMatch = {
  range: Range,
  query: string,
  text: string,
  usedChar: string,
} | null

export function findSuggestionMatch(config: Trigger): SuggestionMatch {
  const {
    char,
    allowSpaces,
    startOfLine,
    $position,
  } = config

  // Matching expressions used for later
  const charArr = Array.isArray(char) ? char : [char];

  let matchResult: MatchResult = null;
  for(const c of charArr) {
    matchResult = getMatchResult(c, startOfLine, allowSpaces, $position)
    if (matchResult !== null) break;
  }

  if (!matchResult?.match) return null;

  // JavaScript doesn't have lookbehinds; this hacks a check that first character is " "
  // or the line beginning
  const matchPrefix = matchResult.match.input.slice(Math.max(0, matchResult.match.index - 1), matchResult.match.index);

  if (!/^[\s\0]?$/.test(matchPrefix)) {
    return null
  }

  // The absolute position of the match in the document
  const from = matchResult.match.index + $position.start()
  let to = from + matchResult.match[0].length

  // Edge case handling; if spaces are allowed and we're directly in between
  // two triggers
  if (allowSpaces && matchResult.suffix.test(matchResult.text.slice(to - 1, to + 1))) {
    matchResult.match[0] += ' '
    to += 1
  }

  // If the $position is located within the matched substring, return that range
  if (from < $position.pos && to >= $position.pos) {
    return {
      range: {
        from,
        to,
      },
      query: matchResult.match[0].slice(matchResult.usedChar.length),
      text: matchResult.match[0],
      usedChar: matchResult.usedChar
    };
  }

  return null;
}

type MatchResult = {match: RegExpMatchArray, prefix: string, suffix: RegExp, text: string, usedChar: string} | null;

function getMatchResult(char: string, startOfLine: boolean, allowSpaces: boolean, $position: ResolvedPos): MatchResult {
  const escapedChar = char
    .split('')
    .map(c => `\\${c}`)
    .join('')

  const suffix = new RegExp(`\\s${escapedChar}$`);
  const prefix = startOfLine ? "^" : "";
  const regexp = allowSpaces
    ? new RegExp(`${prefix}${escapedChar}.*?(?=\\s${escapedChar}|$)`, "gm")
    : new RegExp(`${prefix}(?:^)?${escapedChar}[^\\s${escapedChar}]*`, "gm");

  const isTopLevelNode = $position.depth <= 0;
  const textFrom = isTopLevelNode ? 0 : $position.before();
  const textTo = $position.pos;
  const text: string = $position.doc.textBetween(textFrom, textTo, "\0", "\0");
  const match = Array.from(text.matchAll(regexp)).pop();

  if (!match || match.input === undefined || match.index === undefined) {
    return null;
  }

  return {
    match,
    prefix,
    suffix,
    text,
    usedChar: char.trim()
  }
}
