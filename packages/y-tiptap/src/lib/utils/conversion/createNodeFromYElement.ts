import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import type { ComputeYChange } from '../../../types/YChange.js'
import * as PModel from 'prosemirror-model'
import * as Y from 'yjs'
import { isVisible } from '../binding/isVisible.js'
import { deleteMapping } from '../binding/deleteMapping.js'
import { projectedMappings } from '../binding/projectedMappings.js'

import { getContentSnapshot } from './getContentSnapshot.js'
import { createTextNodesFromYText } from './createTextNodesFromYText.js'
import { deleteYType } from './deleteYType.js'
import { mergeNextYText } from './mergeNextYText.js'
import { toError } from './toError.js'

const isAbsentFromSnapshots = (
  type: Y.XmlElement | Y.XmlText | Y.XmlHook,
  snapshot?: Y.Snapshot,
  prevSnapshot?: Y.Snapshot,
) =>
  snapshot !== undefined &&
  prevSnapshot !== undefined &&
  type._item !== null &&
  !isVisible(type._item, snapshot) &&
  !isVisible(type._item, prevSnapshot)

const getSnapshotChildren = (
  el: Y.XmlElement,
  snapshot?: Y.Snapshot,
  prevSnapshot?: Y.Snapshot,
  contentSnapshot?: Y.Snapshot,
) => {
  if (snapshot === undefined || prevSnapshot === undefined) return el.toArray()
  if (contentSnapshot !== snapshot) {
    return contentSnapshot === undefined
      ? el.toArray()
      : Y.typeListToArraySnapshot(el, contentSnapshot)
  }
  return Y.typeListToArraySnapshot(el, new Y.Snapshot(prevSnapshot.ds, snapshot.sv))
}

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

  const contentSnapshot = getContentSnapshot(el, snapshot, prevSnapshot)

  const children: PModel.Node[] = []
  let hasSkippedChild = false
  const createChildren = (type: Y.XmlElement | Y.XmlText | Y.XmlHook) => {
    if (isAbsentFromSnapshots(type, snapshot, prevSnapshot)) return

    if (type instanceof Y.XmlElement) {
      const node = createNodeFromYElement(
        type,
        schema,
        meta,
        snapshot,
        prevSnapshot,
        computeYChange,
      )
      // Children with skipped content are not cached
      if (node === null || meta.mapping.get(type) !== node) hasSkippedChild = true
      if (node !== null) children.push(node)
      return
    }

    if (!(type instanceof Y.XmlText)) return

    if (meta.deferTextMerge) meta.deferTextMerge(type)
    else mergeNextYText(type)
    const textNodes = createTextNodesFromYText(
      type,
      schema,
      meta,
      snapshot,
      prevSnapshot,
      computeYChange,
    )
    if (textNodes === null) hasSkippedChild = true
    // Avoid spreading, which overflows the call stack for many formatting runs
    textNodes?.forEach(textNode => children.push(textNode))
  }
  getSnapshotChildren(el, snapshot, prevSnapshot, contentSnapshot).forEach(createChildren)
  try {
    const attrs: Record<string, unknown> = el.getAttributes(contentSnapshot)
    const ychange = snapshot ? getYChange(el, snapshot, prevSnapshot, computeYChange) : undefined
    if (ychange !== undefined) attrs.ychange = ychange

    let node = schema.node(el.nodeName, attrs, children)
    if (cachedSingleNode?.eq(node)) {
      node = cachedSingleNode
    }

    // Skipped content must be checked again on the next projection
    if (hasSkippedChild && meta.reportInvalidContent) {
      deleteMapping(meta.mapping, el)
      return node
    }

    setProjectedNode(meta, el, node)
    return node
  } catch (error) {
    deleteMapping(meta.mapping, el)

    if (meta.reportInvalidContent) {
      meta.reportInvalidContent(toError(error))
      return null
    }

    // Remove unrenderable shared content so later projections do not repeat the failure.
    deleteYType(el)
    return null
  }
}
