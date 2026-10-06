import type { Transaction } from '@tiptap/pm/state'

import type { SearchResult } from '../search/search.js'
import type { ResultGroup } from './groupResults.js'

function replaceSeparateResults(
  tr: Transaction,
  results: SearchResult[],
  replaceTerm: string,
): void {
  for (const result of [...results].reverse()) {
    tr.insertText(replaceTerm, result.from, result.to)
  }
}

function createReplacement(
  group: ResultGroup,
  text: string,
  firstResult: SearchResult,
  replaceTerm: string,
): string {
  let offset = firstResult.from - group.from
  const replacement: string[] = []

  for (const result of group.results) {
    const from = result.from - group.from
    const to = result.to - group.from

    replacement.push(text.slice(offset, from), replaceTerm)
    offset = to
  }

  return replacement.join('')
}

export function replaceGroup(tr: Transaction, group: ResultGroup, replaceTerm: string): void {
  const firstResult = group.results[0]
  const lastResult = group.results.at(-1)

  if (!lastResult) {
    return
  }

  if (group.text === null) {
    replaceSeparateResults(tr, group.results, replaceTerm)
    return
  }

  tr.insertText(
    createReplacement(group, group.text, firstResult, replaceTerm),
    firstResult.from,
    lastResult.to,
  )
}
