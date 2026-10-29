import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import type { ComputeYChange } from '../../../types/YChange.js'
import * as PModel from 'prosemirror-model'
import * as Y from 'yjs'
import { isVisible } from '../binding/isVisible.js'
import { deleteMapping } from '../binding/deleteMapping.js'
import { projectedMappings } from '../binding/projectedMappings.js'

import { createTextNodesFromYText } from './createTextNodesFromYText.js'
import { deleteYType } from './deleteYType.js'
import { mergeNextYText } from './mergeNextYText.js'

const getYChange = (
  el: Y.XmlElement,
  snapshot: Y.Snapshot,
  prevSnapshot?: Y.Snapshot,
  computeYChange?: ComputeYChange,
) => {
  if (!el._item) return undefined

  if (!isVisible(el._item, snapshot)) {
    return computeYChange ? computeYChange('removed', el._item.id) : { type: 'removed' }
  }

  if (!isVisible(el._item, prevSnapshot)) {
    return computeYChange ? computeYChange('added', el._item.id) : { type: 'added' }
  }

  return undefined
}

const setProjectedNode = (meta: BindingMetadata, el: Y.XmlElement, node: PModel.Node) => {
  meta.mapping.set(el, node)
  let projectedNodes = projectedMappings.get(meta.mapping)

  if (projectedNodes === undefined) {
    projectedNodes = new WeakMap()
    projectedMappings.set(meta.mapping, projectedNodes)
  }

  projectedNodes.set(el, node)
}

export const createNodeFromYElement = (
  el: Y.XmlElement<{ [key: string]: string }>,
  schema: PModel.Schema,
  meta: BindingMetadata,
  snapshot?: Y.Snapshot,
  prevSnapshot?: Y.Snapshot,
  computeYChange?: ComputeYChange,
): PModel.Node | null => {
  const cachedNode = meta.mapping.get(el)
  const cachedSingleNode = Array.isArray(cachedNode) ? undefined : cachedNode

  // Local nodes need projection checks to preserve overlapping mark order.
  if (
    cachedSingleNode !== undefined &&
    projectedMappings.get(meta.mapping)?.get(el) === cachedSingleNode
  ) {
    return cachedSingleNode
  }

  const children: PModel.Node[] = []
  const createChildren = (type: Y.XmlElement | Y.XmlText | Y.XmlHook) => {
    if (type instanceof Y.XmlElement) {
      const node = createNodeFromYElement(
        type,
        schema,
        meta,
        snapshot,
        prevSnapshot,
        computeYChange,
      )
      if (node !== null) children.push(node)
      return
    }

    if (!(type instanceof Y.XmlText)) return

    mergeNextYText(type)
    const textNodes = createTextNodesFromYText(
      type,
      schema,
      meta,
      snapshot,
      prevSnapshot,
      computeYChange,
    )
    if (textNodes !== null) children.push(...textNodes)
  }
  if (snapshot === undefined || prevSnapshot === undefined) {
    el.toArray().forEach(createChildren)
  } else {
    Y.typeListToArraySnapshot(el, new Y.Snapshot(prevSnapshot.ds, snapshot.sv)).forEach(
      createChildren,
    )
  }
  try {
    const attrs: Record<string, unknown> = el.getAttributes(snapshot)
    const ychange = snapshot ? getYChange(el, snapshot, prevSnapshot, computeYChange) : undefined
    if (ychange !== undefined) attrs.ychange = ychange

    let node = schema.node(el.nodeName, attrs, children)
    if (cachedSingleNode?.eq(node)) {
      node = cachedSingleNode
    }

    setProjectedNode(meta, el, node)
    return node
  } catch {
    // Remove unrenderable shared content so later projections do not repeat the failure.
    deleteYType(el)
    deleteMapping(meta.mapping, el)
    return null
  }
}
