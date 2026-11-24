import type { NodeSelection } from '@tiptap/pm/state'
import type { Node } from '@tiptap/pm/model'
import type { SyncPluginState } from '@tiptap/y-tiptap'
import { relativePositionToAbsolutePosition } from '@tiptap/y-tiptap'
import * as Y from 'yjs'

export function getNodeAnchor(selection: NodeSelection, sync: SyncPluginState) {
  const candidates = [...sync.binding.mapping].filter(
    (entry): entry is [Y.XmlElement, Node] =>
      entry[0] instanceof Y.XmlElement && entry[1] === selection.node,
  )

  for (const [type] of candidates) {
    const anchor = createElementAnchor(type)

    if (!anchor) {
      continue
    }
    const position = relativePositionToAbsolutePosition(
      sync.doc,
      sync.type,
      anchor,
      sync.binding.mapping,
    )

    if (position === selection.from) {
      return anchor
    }
  }

  return null
}

function createElementAnchor(type: Y.XmlElement) {
  const parent = type.parent

  if (!parent) {
    return null
  }

  const parentId = parent._item ? parent._item.id : null
  const parentName = parentId ? null : Y.findRootTypeKey(parent)
  return new Y.RelativePosition(parentId, parentName, type._item!.id, 0)
}
