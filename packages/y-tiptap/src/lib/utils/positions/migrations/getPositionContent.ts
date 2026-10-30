import type { Node } from 'prosemirror-model'
import type { PositionCharacter, PositionNode } from '../../../../types/PositionMigration.js'
import * as Y from 'yjs'
import { normalizePNodeContent } from '../../conversion/normalizePNodeContent.js'
import { getTextCharacters } from './getTextCharacters.js'

export const getPositionContent = (fragment: Y.XmlFragment, doc: Node) => {
  const characters: PositionCharacter[] = []
  const nodes: PositionNode[] = []
  const emptyTexts: PositionNode[] = []

  if (fragment.length === 0) {
    return { characters, nodes, emptyTexts }
  }

  const visit = (type: Y.XmlFragment, node: Node, position: number) => {
    const children = type.toArray()
    const content = normalizePNodeContent(node)
    let offset = position

    if (node.content.size === 0) {
      children.forEach(child => {
        if (child instanceof Y.XmlText && child._item) {
          emptyTexts.push({ id: child._item.id, position: position - 1, end: position })
        }
      })
    }

    content.forEach((child, index) => {
      const shared = children[index]

      if (!Array.isArray(child)) {
        if (!(shared instanceof Y.XmlElement) || !shared._item) {
          throw new Error('Position tracking requires synchronized editor content')
        }

        nodes.push({ id: shared._item.id, position: offset, end: offset + child.nodeSize - 1 })

        if (!child.isLeaf) {
          visit(shared, child, offset + 1)
        }

        offset += child.nodeSize
        return
      }

      if (!(shared instanceof Y.XmlText)) {
        throw new Error('Position tracking requires synchronized editor text')
      }

      const text = getTextCharacters(shared, offset)
      characters.push(...text)
      offset += text.length
    })
  }

  visit(fragment, doc, 0)
  return { characters, nodes, emptyTexts }
}
