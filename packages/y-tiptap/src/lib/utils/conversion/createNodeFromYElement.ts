import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import type { ComputeYChange } from '../../../types/YChange.js'
import * as PModel from 'prosemirror-model'
import * as error from 'lib0/error'
import { ySyncPluginKey } from '../../plugins/keys.js'
import * as Y from 'yjs'
import { isVisible } from '../binding/isVisible.js'

import { createTextNodesFromYText } from './createTextNodesFromYText.js'

export const createNodeFromYElement = (
  el: Y.XmlElement<{ [key: string]: string }>,
  schema: PModel.Schema,
  meta: BindingMetadata,
  snapshot?: Y.Snapshot,
  prevSnapshot?: Y.Snapshot,
  computeYChange?: ComputeYChange,
) => {
  const children: PModel.Node[] = []
  const createChildren = (type: Y.XmlElement | Y.XmlText | Y.XmlHook) => {
    if (type instanceof Y.XmlElement) {
      const n = createNodeIfNotExists(type, schema, meta, snapshot, prevSnapshot, computeYChange)
      if (n !== null) {
        children.push(n)
      }
    } else if (type instanceof Y.XmlText) {
      const content = type._item?.right?.content
      const nextytext = content instanceof Y.ContentType ? content.type : null
      const nextItem = nextytext?._item
      const nextDoc = nextytext?.doc
      if (
        nextytext instanceof Y.Text &&
        nextItem &&
        nextDoc &&
        !nextItem.deleted &&
        // Only the creator merges this text item to avoid competing repairs on peers.
        nextItem.id.client === nextDoc.clientID
      ) {
        type.applyDelta([{ retain: type.length }, ...nextytext.toDelta()])
        nextDoc.transact(tr => {
          nextItem.delete(tr)
        })
      }
      const ns = createTextNodesFromYText(
        type,
        schema,
        meta,
        snapshot,
        prevSnapshot,
        computeYChange,
      )
      if (ns !== null) {
        ns.forEach(textchild => {
          if (textchild !== null) {
            children.push(textchild)
          }
        })
      }
    }
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
    if (snapshot !== undefined && el._item) {
      if (!isVisible(el._item, snapshot)) {
        attrs.ychange = computeYChange
          ? computeYChange('removed', el._item.id)
          : { type: 'removed' }
      } else if (!isVisible(el._item, prevSnapshot)) {
        attrs.ychange = computeYChange ? computeYChange('added', el._item.id) : { type: 'added' }
      }
    }
    const node = schema.node(el.nodeName, attrs, children)
    meta.mapping.set(el, node)
    return node
  } catch {
    // Remove unrenderable shared content so later projections do not repeat the failure.
    const doc = el.doc
    const item = el._item
    if (!doc || !item) throw error.unexpectedCase()
    doc.transact(transaction => {
      item.delete(transaction)
    }, ySyncPluginKey)
    meta.mapping.delete(el)
    return null
  }
}

const createNodeIfNotExists = (
  el: Y.XmlElement | Y.XmlHook | Y.XmlText,
  schema: PModel.Schema,
  meta: BindingMetadata,
  snapshot?: Y.Snapshot,
  prevSnapshot?: Y.Snapshot,
  computeYChange?: ComputeYChange,
) => {
  const node = meta.mapping.get(el)
  if (node === undefined) {
    if (el instanceof Y.XmlElement) {
      return createNodeFromYElement(el, schema, meta, snapshot, prevSnapshot, computeYChange)
    } else {
      throw error.methodUnimplemented()
    }
  }
  if (Array.isArray(node)) throw error.unexpectedCase()
  return node
}
