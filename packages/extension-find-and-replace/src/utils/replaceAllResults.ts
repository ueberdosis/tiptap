import type { EditorState, Transaction } from '@tiptap/pm/state'

import type { SearchRegex } from '../search/regex.js'
import type { SearchResult } from '../search/search.js'
import { createResultReplacement } from './createResultReplacement.js'
import { groupResults } from './groupResults.js'
import { replaceGroup } from './replaceGroup.js'

export function replaceAllResults(
  tr: Transaction,
  state: EditorState,
  results: SearchResult[],
  replaceTerm: string,
  regex: SearchRegex | null,
): void {
  const groups = groupResults(state, results)
  const replacement = createResultReplacement(state.doc, replaceTerm, regex, true)

  for (const group of groups.reverse()) {
    replaceGroup(tr, group, replacement)
  }
}
