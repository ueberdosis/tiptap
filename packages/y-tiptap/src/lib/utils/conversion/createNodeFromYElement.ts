import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import type { ComputeYChange } from '../../../types/YChange.js'
import * as PModel from 'prosemirror-model'
import * as Y from 'yjs'
import { isVisible } from '../binding/isVisible.js'
import { projectedMappings } from '../binding/projectedMappings.js'

import { getContentSnapshot } from './getContentSnapshot.js'
import { createTextNodesFromYText } from './createTextNodesFromYText.js'

export const createNodeFromYElement = (
  el: Y.XmlElement<{ [key: string]: string }>,
  schema: PModel.Schema,
  meta: BindingMetadata,
  snapshot?: Y.Snapshot,
  prevSnapshot?: Y.Snapshot,
  computeYChange?: ComputeYChange,
) => {
  const cachedNode = meta.mapping.get(el)

  // Local nodes need projection checks to preserve overlapping mark order.
  if (
    cachedNode !== undefined &&
    !Array.isArray(cachedNode) &&
    projectedMappings.get(meta.mapping)?.get(el) === cachedNode
  ) {
    return cachedNode
  }

  const contentSnapshot = getContentSnapshot(el, snapshot, prevSnapshot)
  const isRemoved = contentSnapshot !== snapshot

  const children: PModel.Node[] = []
  const createChildren = (type: Y.XmlElement | Y.XmlText | Y.XmlHook) => {
    if (type instanceof Y.XmlElement) {
      children.push(
        createNodeFromYElement(type, schema, meta, snapshot, prevSnapshot, computeYChange),
      )
    } else if (type instanceof Y.XmlText) {
      children.push(
        ...createTextNodesFromYText(type, schema, meta, snapshot, prevSnapshot, computeYChange),
      )
    } else {
      throw new Error('Cannot project a Yjs XML hook')
    }
  }
  if (snapshot === undefined || prevSnapshot === undefined) {
    el.toArray().forEach(createChildren)
  } else if (isRemoved) {
    const removedChildren =
      contentSnapshot === undefined ? el.toArray() : Y.typeListToArraySnapshot(el, contentSnapshot)
    removedChildren.forEach(createChildren)
  } else {
    Y.typeListToArraySnapshot(el, new Y.Snapshot(prevSnapshot.ds, snapshot.sv)).forEach(
      createChildren,
    )
  }
  const attrs: Record<string, unknown> = el.getAttributes(contentSnapshot)
  if (snapshot !== undefined && el._item) {
    if (!isVisible(el._item, snapshot)) {
      attrs.ychange = computeYChange ? computeYChange('removed', el._item.id) : { type: 'removed' }
    } else if (!isVisible(el._item, prevSnapshot)) {
      attrs.ychange = computeYChange ? computeYChange('added', el._item.id) : { type: 'added' }
    }
  }
  let node = schema.node(el.nodeName, attrs, children)
  if (cachedNode !== undefined && !Array.isArray(cachedNode) && cachedNode.eq(node)) {
    node = cachedNode
  }

  meta.mapping.set(el, node)
  let projectedNodes = projectedMappings.get(meta.mapping)

  if (projectedNodes === undefined) {
    projectedNodes = new WeakMap()
    projectedMappings.set(meta.mapping, projectedNodes)
  }

  projectedNodes.set(el, node)
  return node
}
