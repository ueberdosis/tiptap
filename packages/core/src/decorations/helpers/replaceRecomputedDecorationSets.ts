import type { Node } from '@tiptap/pm/model'
import type { Mapping } from '@tiptap/pm/transform'
import { DecorationSet } from '@tiptap/pm/view'

interface ReplaceRecomputedDecorationSetsOptions {
  doc: Node
  mapping: Mapping
  previousMergedSet: DecorationSet
  decorationSetsByExtension: Record<string, DecorationSet>
  recomputedNames: Set<string>
}

/**
 * Patches the previous merged set incrementally instead of rebuilding it.
 * @param options The options for the incremental merge.
 * @returns The patched merged DecorationSet.
 */
export function replaceRecomputedDecorationSets({
  doc,
  mapping,
  previousMergedSet,
  decorationSetsByExtension,
  recomputedNames,
}: ReplaceRecomputedDecorationSetsOptions): DecorationSet {
  let merged = previousMergedSet.map(mapping, doc)

  for (const name of recomputedNames) {
    const oldDecorations = merged
      .find()
      .filter(decoration => (decoration.spec as { extensionName?: string }).extensionName === name)

    merged = merged.remove(oldDecorations)

    const newSet = decorationSetsByExtension[name]

    if (newSet && newSet !== DecorationSet.empty) {
      merged = merged.add(doc, newSet.find())
    }
  }

  return merged
}
