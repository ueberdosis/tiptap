/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExtensionAttribute, mergeAttributes } from '@tiptap/core'

import type { MarkType, NodeType } from './types'

/**
 * This function returns the attributes of a node or mark that are defined by the given extension attributes.
 * @param nodeOrMark The node or mark to get the attributes from
 * @param extensionAttributes The extension attributes to use
 * @param onlyRenderedAttributes If true, only attributes that are rendered in the HTML are returned
 */
export function getAttributes(
  nodeOrMark: NodeType | MarkType,
  extensionAttributes: ExtensionAttribute[],
  onlyRenderedAttributes?: boolean,
): Record<string, any> {
  const nodeOrMarkAttributes = nodeOrMark.attrs

  if (!nodeOrMarkAttributes) {
    return {}
  }

  return extensionAttributes
    .filter(item => {
      if (item.type !== nodeOrMark.type) {
        return false
      }
      if (onlyRenderedAttributes) {
        return item.attribute.rendered
      }
      return true
    })
    .map(item => {
      if (!item.attribute.renderHTML) {
        return {
          [item.name]:
            item.name in nodeOrMarkAttributes
              ? nodeOrMarkAttributes[item.name]
              : item.attribute.default,
        }
      }

      return (
        item.attribute.renderHTML(nodeOrMarkAttributes) || {
          [item.name]:
            item.name in nodeOrMarkAttributes
              ? nodeOrMarkAttributes[item.name]
              : item.attribute.default,
        }
      )
    })
    .reduce((attributes, attribute) => mergeAttributes(attributes, attribute), {})
}

/**
 * This function returns the HTML attributes of a node or mark that are defined by the given extension attributes.
 * @param nodeOrMark The node or mark to get the attributes from
 * @param extensionAttributes The extension attributes to use
 */
export function getHTMLAttributes(
  nodeOrMark: NodeType | MarkType,
  extensionAttributes: ExtensionAttribute[],
) {
  return getAttributes(nodeOrMark, extensionAttributes, true)
}
