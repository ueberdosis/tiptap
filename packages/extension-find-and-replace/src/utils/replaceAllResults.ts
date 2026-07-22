import type { EditorState, Transaction } from '@tiptap/pm/state'

import type { SearchResult } from '../search.js'
import { groupResults } from './groupResults.js'
import { replaceGroup } from './replaceGroup.js'

export function replaceAllResults(
  tr: Transaction,
  state: EditorState,
  results: SearchResult[],
  replaceTerm: string,
): void {
  const groups = groupResults(state, results)

  for (const group of groups.reverse()) {
    replaceGroup(tr, group, replaceTerm)
  }
}
