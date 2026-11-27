import type { FragmentUpdater } from '../../../types/FragmentUpdater.js'
import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import type { NormalizedPNodeContent } from '../../../types/NormalizedPNodeContent.js'
import type { TransactionSource } from '../../../types/TransactionSource.js'
import * as PModel from 'prosemirror-model'
import { simpleDiff } from 'lib0/diff'
import * as Y from 'yjs'
import { ySyncPluginKey } from '../../plugins/keys.js'
import { deleteMapping } from '../binding/deleteMapping.js'
import { marksToAttributes } from '../conversion/marksToAttributes.js'
import { mappedIdentity } from './mappedIdentity.js'
import { updateYText } from './updateYText.js'
import { ytextTrans } from './ytextTrans.js'

type TextRun = { texts: Y.XmlText[] }
type ElementChild = { element: Y.XmlElement<{ [key: string]: string }> }
type ChildGroup = TextRun | ElementChild

type YChild = Y.XmlElement<{ [key: string]: string }> | Y.XmlHook | Y.XmlText

const groupChildren = (yChildren: YChild[]): ChildGroup[] | null => {
  const groups: ChildGroup[] = []

  for (const child of yChildren) {
    if (child instanceof Y.XmlText) {
      const last = groups[groups.length - 1]
      if (last !== undefined && 'texts' in last) {
        last.texts.push(child)
      } else {
        groups.push({ texts: [child] })
      }
      continue
    }

    if (child instanceof Y.XmlElement) {
      groups.push({ element: child })
      continue
    }

    return null
  }

  return groups
}

const linesUp = (
  groups: ChildGroup[],
  pChildren: NormalizedPNodeContent,
  meta: BindingMetadata,
): boolean => {
  if (groups.length !== pChildren.length) return false
  if (!groups.some(group => 'texts' in group && group.texts.length > 1)) return false

  return groups.every((group, index) => {
    const pChild = pChildren[index]

    if ('texts' in group) {
      return pChild instanceof Array
    }

    // A moved element keeps its own identity, so only a mapped element lines up.
    return !(pChild instanceof Array) && mappedIdentity(meta.mapping.get(group.element), pChild)
  })
}

const textSpans = (texts: Y.XmlText[]) => {
  const spans: { start: number; end: number }[] = []
  let position = 0

  texts.forEach(text => {
    const length = ytextTrans(text).str.length
    spans.push({ start: position, end: position + length })
    position += length
  })

  return spans
}

const applyRunMarks = (texts: Y.XmlText[], ptexts: PModel.Node[], meta: BindingMetadata) => {
  const spans = textSpans(texts)
  let nodeStart = 0
  const nodes = ptexts.map(node => {
    const length = node.text?.length ?? 0
    const span = { start: nodeStart, end: nodeStart + length, node }
    nodeStart += length
    return span
  })

  texts.forEach((text, index) => {
    const span = spans[index]

    if (span.end <= span.start) return

    const nAttrs = ytextTrans(text).nAttrs
    const delta: { retain: number; attributes: Record<string, unknown> }[] = []

    nodes.forEach(({ start, end, node }) => {
      const overlapStart = Math.max(span.start, start)
      const overlapEnd = Math.min(span.end, end)

      if (overlapEnd > overlapStart) {
        delta.push({
          retain: overlapEnd - overlapStart,
          attributes: Object.assign({}, nAttrs, marksToAttributes(node.marks, meta)),
        })
      }
    })

    if (delta.length > 0) text.applyDelta(delta)
  })
}

const updateTextRun = (texts: Y.XmlText[], ptexts: PModel.Node[], meta: BindingMetadata) => {
  if (texts.length === 1) {
    updateYText(texts[0], ptexts, meta)
    return
  }

  // A text type that shares its run only holds part of it, so none of them
  // stands for the whole run.
  texts.forEach(text => deleteMapping(meta.mapping, text))

  const yJoined = texts.map(text => ytextTrans(text).str).join('')
  const pJoined = ptexts.map(node => node.text ?? '').join('')
  const { insert, remove, index } = simpleDiff(yJoined, pJoined)
  const spans = textSpans(texts)

  // Cut the delete range across the siblings it touches.
  texts.forEach((text, i) => {
    const delStart = Math.max(spans[i].start, index)
    const delEnd = Math.min(spans[i].end, index + remove)

    if (delEnd > delStart) {
      text.delete(delStart - spans[i].start, delEnd - delStart)
    }
  })

  // Insert into the sibling that holds the position, the left one at a boundary.
  if (insert.length > 0) {
    const target = texts.findIndex((_, i) => index <= spans[i].end)
    const targetIndex = target === -1 ? texts.length - 1 : target
    texts[targetIndex].insert(index - spans[targetIndex].start, insert)
  }

  applyRunMarks(texts, ptexts, meta)
}

/**
 * Updates a fragment whose text runs hold sibling text types in place,
 * instead of copying text between siblings. Returns false when the runs
 * and elements do not line up with the ProseMirror children, so the
 * caller falls back to the normal update.
 */
export const updateSiblingTextRuns = (
  y: TransactionSource,
  pChildren: NormalizedPNodeContent,
  yChildren: YChild[],
  meta: BindingMetadata,
  updateFragment: FragmentUpdater,
): boolean => {
  const groups = groupChildren(yChildren)

  if (groups === null || !linesUp(groups, pChildren, meta)) {
    return false
  }

  y.transact(() => {
    groups.forEach((group, index) => {
      const pChild = pChildren[index]

      if ('texts' in group && pChild instanceof Array) {
        updateTextRun(group.texts, pChild, meta)
      } else if (!('texts' in group) && !(pChild instanceof Array)) {
        updateFragment(y, group.element, pChild, meta)
      }
    })
  }, ySyncPluginKey)

  return true
}
