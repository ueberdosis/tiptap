import type { Transaction } from '@tiptap/pm/state'

import type { SearchResult } from '../search/search.js'
import type { ResultReplacement } from './createResultReplacement.js'
import type { ResultGroup } from './groupResults.js'

function replaceSeparateResults(
  tr: Transaction,
  results: SearchResult[],
  replacement: ResultReplacement,
): void {
  for (const result of [...results].reverse()) {
    tr.insertText(replacement(result), result.from, result.to)
  }
}

function createReplacement(
  group: ResultGroup,
  text: string,
  firstResult: SearchResult,
  replacementFor: ResultReplacement,
): string {
  let offset = firstResult.from - group.from
  const replacement: string[] = []

  for (const result of group.results) {
    const from = result.from - group.from
    const to = result.to - group.from

    replacement.push(text.slice(offset, from), replacementFor(result))
    offset = to
  }

  return replacement.join('')
}

export function replaceGroup(
  tr: Transaction,
  group: ResultGroup,
  replacement: ResultReplacement,
): void {
  const firstResult = group.results[0]
  const lastResult = group.results.at(-1)

  if (!lastResult) {
    return
  }

  if (group.text === null) {
    replaceSeparateResults(tr, group.results, replacement)
    return
  }

  tr.insertText(
    createReplacement(group, group.text, firstResult, replacement),
    firstResult.from,
    lastResult.to,
  )
}
