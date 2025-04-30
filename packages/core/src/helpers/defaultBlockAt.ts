import type { ContentMatch, NodeType } from '@tiptap/pm/model'

/**
 * Gets the default block type at a given match
 * @param match The content match to get the default block type from
 * @returns The default block type or null
 */
export function defaultBlockAt(match: ContentMatch): NodeType | null {
  for (let i = 0; i < match.edgeCount; i += 1) {
    const { type } = match.edge(i)

    if (type.isTextblock && !type.hasRequiredAttrs()) {
      return type
    }
  }

  return null
}
