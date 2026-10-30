import { Node } from 'prosemirror-model'

export const hasDistinctiveAttrs = (node: Node) => {
  const specAttrs = node.type.spec.attrs || {}
  return Object.keys(node.attrs).some(key => {
    const spec = specAttrs[key]
    return (
      spec == null ||
      !Object.prototype.hasOwnProperty.call(spec, 'default') ||
      spec.default !== node.attrs[key]
    )
  })
}
