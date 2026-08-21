import type { EditorState, Transaction } from '@tiptap/pm/state'
import type { RE2JS } from 're2js'

import type { SearchResult } from '../search/search.js'
import type { SearchMatcher } from '../search/search-matcher.js'
import { createResultReplacement } from './createResultReplacement.js'
import { groupResults } from './groupResults.js'
import { replaceGroup } from './replaceGroup.js'

export function replaceAllResults(
  tr: Transaction,
  state: EditorState,
  results: SearchResult[],
  replaceTerm: string,
  matcher: SearchMatcher<RE2JS> | null,
): void {
  const groups = groupResults(state, results)
  const replacement = createResultReplacement(state.doc, replaceTerm, matcher, true)

  for (const group of groups.reverse()) {
    replaceGroup(tr, group, replacement)
  }
}
