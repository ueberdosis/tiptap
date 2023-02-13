import { ContentMatch, NodeType } from '@tiptap/pm/model'

export function defaultBlockAt(match: ContentMatch): NodeType | null {
  for (let i = 0; i < match.edgeCount; i += 1) {
    const { type } = match.edge(i)

    if (type.isTextblock && !type.hasRequiredAttrs()) {
      return type
    }
  }

  return null
}
