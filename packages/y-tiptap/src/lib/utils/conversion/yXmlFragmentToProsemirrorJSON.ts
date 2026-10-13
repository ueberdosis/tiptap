import type { YType } from '../../../types/YType.js'
import type { ProsemirrorJSONMark } from '../../../types/ProsemirrorJSONNode.js'
import type { TextDelta } from '../../../types/TextDelta.js'
import type { ProsemirrorJSONNode } from '../../../types/ProsemirrorJSONNode.js'
import { yattr2markname } from './yattr2markname.js'
import * as Y from 'yjs'
import * as error from 'lib0/error'

/** Reads ProseMirror JSON from a Yjs XML fragment. */
export function yXmlFragmentToProsemirrorJSON(xmlFragment: Y.XmlFragment) {
  const items = xmlFragment.toArray()
  const serialize = (item: YType): ProsemirrorJSONNode | ProsemirrorJSONNode[] => {
    let response: ProsemirrorJSONNode | ProsemirrorJSONNode[]
    if (item instanceof Y.XmlText) {
      const delta: TextDelta[] = item.toDelta()
      response = delta.map(d => {
        const text: ProsemirrorJSONNode = {
          type: 'text',
          text: d.insert,
        }
        const attributes = d.attributes
        if (attributes) {
          text.marks = Object.keys(attributes).map(type_ => {
            const attrs = attributes[type_]
            const type = yattr2markname(type_)
            const mark: ProsemirrorJSONMark = {
              type,
            }
            if (Object.keys(attrs)) {
              mark.attrs = attrs
            }
            return mark
          })
        }
        return text
      })
    } else if (item instanceof Y.XmlElement) {
      response = {
        type: item.nodeName,
      }
      const attrs = item.getAttributes()
      if (Object.keys(attrs).length) {
        response.attrs = attrs
      }
      const children = item.toArray()
      if (children.length) {
        response.content = children.map(serialize).flat()
      }
    } else {
      error.unexpectedCase()
    }
    return response
  }
  return {
    type: 'doc',
    content: items.map(serialize),
  }
}
