import type { EditorState } from '@tiptap/pm/state'

import type { SearchResult } from '../search.js'
import type { TextNodeResult } from './getTextNodeResult.js'
import { getTextNodeResult } from './getTextNodeResult.js'

export interface ResultGroup {
  from: number
  text: string | null
  results: SearchResult[]
}

function shouldMergeResult(
  group: ResultGroup | undefined,
  textNode: TextNodeResult | null,
): boolean {
  if (!group || !textNode) {
    return false
  }

  return group.from === textNode.from && group.text !== null
}

function createTextResultGroup(result: SearchResult, textNode: TextNodeResult): ResultGroup {
  return {
    from: textNode.from,
    text: textNode.text,
    results: [result],
  }
}

function createResultGroup(result: SearchResult): ResultGroup {
  return {
    from: result.from,
    text: null,
    results: [result],
  }
}

function appendResult(
  groups: ResultGroup[],
  result: SearchResult,
  textNode: TextNodeResult | null,
): void {
  const group = groups.at(-1)

  if (shouldMergeResult(group, textNode)) {
    group!.results.push(result)
    return
  }

  if (textNode) {
    groups.push(createTextResultGroup(result, textNode))
    return
  }

  groups.push(createResultGroup(result))
}

export function groupResults(state: EditorState, results: SearchResult[]): ResultGroup[] {
  const groups: ResultGroup[] = []

  for (const result of results) {
    appendResult(groups, result, getTextNodeResult(state, result))
  }

  return groups
}
