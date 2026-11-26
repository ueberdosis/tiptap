import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import * as PModel from 'prosemirror-model'
import { simpleDiff } from 'lib0/diff'
import * as Y from 'yjs'
import { ytextTrans } from './ytextTrans.js'
import { marksToAttributes } from '../conversion/marksToAttributes.js'

export const updateYText = (ytext: Y.Text, ptexts: PModel.Node[], meta: BindingMetadata) => {
  meta.mapping.set(ytext, ptexts)
  const { nAttrs, str } = ytextTrans(ytext)
  const content = ptexts.map(p => ({
    insert: p.text ?? '',
    attributes: Object.assign({}, nAttrs, marksToAttributes(p.marks, meta)),
  }))
  const { insert, remove, index } = simpleDiff(str, content.map(c => c.insert).join(''))
  ytext.delete(index, remove)
  ytext.insert(index, insert)
  ytext.applyDelta(formatChanges(ytext, content))
}

// Format only the runs whose marks changed, so undo and concurrent edits
// never touch marks this edit did not change.
const formatChanges = (
  ytext: Y.Text,
  content: { insert: string; attributes: Record<string, unknown> }[],
) => {
  const held = ytext.toDelta().map(part => ({
    length: typeof part.insert === 'string' ? part.insert.length : 1,
    attributes: part.attributes ?? {},
  }))
  const ops: { retain: number; attributes?: Record<string, unknown> }[] = []
  let run = 0
  let used = 0
  for (const item of content) {
    let left = item.insert.length
    while (left > 0 && run < held.length) {
      const current = held[run]
      const take = Math.min(left, current.length - used)
      const last = ops[ops.length - 1]
      if (!sameValue(item.attributes, current.attributes)) {
        ops.push({ retain: take, attributes: item.attributes })
      } else if (last && last.attributes === undefined) {
        last.retain += take
      } else {
        ops.push({ retain: take })
      }
      left -= take
      used += take
      if (used === current.length) {
        run++
        used = 0
      }
    }
  }
  return ops
}

// Deep equality where null or undefined counts the same as a missing key.
const sameValue = (left: unknown, right: unknown): boolean => {
  if (left === right) return true
  if (isMissing(left) || isMissing(right)) return isMissing(left) && isMissing(right)
  if (typeof left !== 'object' || typeof right !== 'object') return false
  return sameObject(left, right)
}

const isMissing = (value: unknown) => value === null || value === undefined

const sameObject = (left: object, right: object): boolean => {
  if (Array.isArray(left) || Array.isArray(right)) return sameArray(left, right)
  for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
    if (!sameValue((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key]))
      return false
  }
  return true
}

const sameArray = (left: object, right: object): boolean => {
  if (!Array.isArray(left) || !Array.isArray(right)) return false
  return left.length === right.length && left.every((item, index) => sameValue(item, right[index]))
}
