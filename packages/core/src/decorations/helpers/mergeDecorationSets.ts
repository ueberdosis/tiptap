import type { Node } from '@tiptap/pm/model'
import { DecorationSet } from '@tiptap/pm/view'

/**
 * Merges multiple decoration sets into a single decoration set.
 * @param doc The document to merge the decoration sets for.
 * @param decorationSetsByExtension The decoration sets to merge.
 * @returns The merged decoration set.
 */
export function mergeDecorationSets(
  doc: Node,
  decorationSetsByExtension: Record<string, DecorationSet>,
): DecorationSet {
  const allDecorations = Object.values(decorationSetsByExtension).flatMap(set => set.find())
  return DecorationSet.create(doc, allDecorations)
}
