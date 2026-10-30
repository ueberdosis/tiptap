import type { RelativeSelection } from '../../../types/RelativeSelection.js'
import type { Transaction } from 'prosemirror-state'
import * as PModel from 'prosemirror-model'
import { AllSelection, Selection, TextSelection, NodeSelection } from 'prosemirror-state'
import { findAbsolutePositionAfterStructuralChange } from './findAbsolutePositionAfterStructuralChange.js'
import { isMisresolvedAfterStructuralChange } from './isMisresolvedAfterStructuralChange.js'
import { relativePositionToAbsolutePosition } from './relativePositionToAbsolutePosition.js'
import type { ProsemirrorBinding } from '../binding/ProsemirrorBinding.js'
import { resolvePositionMigration } from './migrations/resolvePositionMigration.js'

const recoverSelectionEndpoint = (
  newDoc: PModel.Node,
  oldDoc: PModel.Node,
  oldAbs: number | null | undefined,
  resolved: number | null,
) => {
  if (oldAbs == null || oldAbs < 0 || oldAbs > oldDoc.content.size) {
    return resolved
  }
  const misresolved =
    resolved === null ||
    (oldAbs > 1 && resolved <= 1) ||
    isMisresolvedAfterStructuralChange(oldDoc, newDoc, oldAbs, resolved)
  if (!misresolved) {
    return resolved
  }
  const recovered = findAbsolutePositionAfterStructuralChange(oldDoc, newDoc, oldAbs)
  return recovered !== null ? recovered : resolved
}
export const restoreRelativeSelection = (
  tr: Transaction,
  relSel: RelativeSelection | null,
  binding: ProsemirrorBinding,
  oldDoc?: PModel.Node,
) => {
  if (relSel !== null && relSel.anchor !== null && relSel.head !== null) {
    if (relSel.type === 'all') {
      tr.setSelection(new AllSelection(tr.doc))
    } else if (relSel.type === 'node') {
      const anchor = relativePositionToAbsolutePosition(
        binding.doc,
        binding.type,
        relSel.anchor,
        binding.mapping,
      )
      if (anchor !== null) {
        tr.setSelection(createSafeNodeSelection(tr, anchor))
      }
    } else if (relSel.type === 'nodeRange') {
      const anchor = relativePositionToAbsolutePosition(
        binding.doc,
        binding.type,
        relSel.anchor,
        binding.mapping,
      )
      const head = relativePositionToAbsolutePosition(
        binding.doc,
        binding.type,
        relSel.head,
        binding.mapping,
      )
      const selection = createSafeNodeRangeSelection(tr, anchor, head, relSel.depth)
      if (selection !== null) {
        tr.setSelection(selection)
      }
    } else {
      let anchor = relativePositionToAbsolutePosition(
        binding.doc,
        binding.type,
        relSel.anchor,
        binding.mapping,
      )
      let head = relativePositionToAbsolutePosition(
        binding.doc,
        binding.type,
        relSel.head,
        binding.mapping,
      )
      if (oldDoc != null) {
        // Content-based recovery must not override an identity transfer or its conflict result.
        if (resolvePositionMigration(binding.type, relSel.anchor) === relSel.anchor) {
          anchor = recoverSelectionEndpoint(tr.doc, oldDoc, relSel.absAnchor, anchor)
        }

        if (resolvePositionMigration(binding.type, relSel.head) === relSel.head) {
          head = recoverSelectionEndpoint(tr.doc, oldDoc, relSel.absHead, head)
        }
      }
      if (anchor === null) {
        anchor = head
      }
      if (head === null) {
        head = anchor
      }
      if (anchor !== null && head !== null) {
        tr.setSelection(TextSelection.between(tr.doc.resolve(anchor), tr.doc.resolve(head)))
      }
    }
  }
}
const createSafeNodeSelection = (tr: Transaction, pos: number) => {
  const $pos = tr.doc.resolve(pos)
  if ($pos.nodeAfter) {
    return NodeSelection.create(tr.doc, pos)
  } else {
    return TextSelection.near($pos)
  }
}
const createSafeNodeRangeSelection = (
  tr: Transaction,
  anchor: number | null,
  head: number | null,
  depth: number | undefined,
) => {
  if (anchor === null || head === null) {
    return null
  }
  const clampedAnchor = Math.min(Math.max(anchor, 0), tr.doc.content.size)
  const clampedHead = Math.min(Math.max(head, 0), tr.doc.content.size)
  try {
    const selection = Selection.fromJSON(tr.doc, {
      type: 'nodeRange',
      anchor: clampedAnchor,
      head: clampedHead,
      depth,
    })
    if (!selection.ranges.length) {
      return TextSelection.near(tr.doc.resolve(clampedAnchor))
    }
    return selection
  } catch {
    return TextSelection.near(tr.doc.resolve(clampedAnchor))
  }
}
