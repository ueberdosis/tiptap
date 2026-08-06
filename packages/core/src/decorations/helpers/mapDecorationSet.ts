import type { Mapping } from '@tiptap/pm/transform'
import type { Node } from '@tiptap/pm/model'
import { DecorationSet } from '@tiptap/pm/view'

type RemovedDecorationSpec = { key?: unknown } | undefined

/**
 * Maps a decoration set through a mapping and prunes the keys of any widget
 * dropped because its position was deleted.
 * @param set The decoration set to map.
 * @param mapping The mapping to use.
 * @param doc The document to map the set through.
 * @param widgetKeys The set of widget keys to prune.
 * @returns The mapped decoration set.
 */
export function mapDecorationSet(
  set: DecorationSet,
  mapping: Mapping,
  doc: Node,
  widgetKeys: Set<string>,
): DecorationSet {
  return set.map(mapping, doc, {
    onRemove: (removedSpec: RemovedDecorationSpec) => {
      const key = removedSpec?.key

      if (typeof key === 'string') {
        widgetKeys.delete(key)
      }
    },
  })
}
