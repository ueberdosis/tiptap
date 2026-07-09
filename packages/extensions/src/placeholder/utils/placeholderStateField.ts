import type { Editor } from '@tiptap/core'
import { getChangedRanges } from '@tiptap/core'
import type { Node } from '@tiptap/pm/model'
import type { EditorState, StateField, Transaction } from '@tiptap/pm/state'
import type { Selection } from '@tiptap/pm/state'
import { DecorationSet } from '@tiptap/pm/view'

import type { PlaceholderOptions } from '../types.js'
import {
  buildPlaceholderDecorations,
  scanRangeForDecorations,
} from './buildPlaceholderDecorations.js'
import {
  getTopLevelBlocksInRange,
  mergeRanges,
  resolveTopLevelRange,
  toContentRelativeRange,
} from './resolveTopLevelRange.js'

/** Options passed to {@link createPlaceholderStateField}. */
export type CreatePlaceholderStateFieldOptions = {
  editor: Editor
  options: PlaceholderOptions
  dataAttribute: string
}

/**
 * Expands a single changed range to the top-level blocks it touches.
 * Also resolves blocks at range boundaries so split/merge edits update
 * adjacent empty nodes (e.g. a new paragraph after Enter).
 */
function collectBlocksForChange(
  doc: Node,
  change: { from: number; to: number },
): Array<{ from: number; to: number }> {
  const ranges = getTopLevelBlocksInRange(doc, change.from, change.to)

  ranges.push(toContentRelativeRange(doc, resolveTopLevelRange(doc, change.from)))

  if (change.to > change.from) {
    ranges.push(
      toContentRelativeRange(
        doc,
        resolveTopLevelRange(doc, Math.min(change.to, doc.content.size + 1) - 1),
      ),
    )
  } else if (change.from < doc.content.size + 1) {
    ranges.push(
      toContentRelativeRange(
        doc,
        resolveTopLevelRange(doc, Math.min(change.from + 1, doc.content.size)),
      ),
    )
  }

  return ranges
}

/**
 * Collects content-relative top-level block ranges that need placeholder
 * decorations recomputed after a transaction.
 */
function collectRescanRanges(
  tr: Transaction,
  oldState: EditorState,
  newState: EditorState,
): Array<{ from: number; to: number }> {
  const ranges: Array<{ from: number; to: number }> = []

  if (tr.docChanged) {
    const changes = getChangedRanges(tr)

    for (const change of changes) {
      ranges.push(...collectBlocksForChange(newState.doc, change.newRange))
    }
  }

  if (tr.selectionSet) {
    ranges.push(
      toContentRelativeRange(
        newState.doc,
        resolveTopLevelRange(newState.doc, tr.mapping.map(oldState.selection.anchor)),
      ),
    )
    ranges.push(
      toContentRelativeRange(
        newState.doc,
        resolveTopLevelRange(newState.doc, newState.selection.anchor),
      ),
    )
  }

  return mergeRanges(ranges)
}

/** Clamps a content-relative range to `[0, doc.content.size]`. */
function clampRange(from: number, to: number, doc: Node): { from: number; to: number } {
  const clampedFrom = Math.max(0, Math.min(from, doc.content.size))
  const clampedTo = Math.max(clampedFrom, Math.min(to, doc.content.size))

  return { from: clampedFrom, to: clampedTo }
}

/**
 * Removes and rebuilds placeholder decorations within the given ranges.
 * Only drops decorations fully contained in a range so mapped decorations
 * on neighbouring blocks (e.g. at a block boundary) are kept intact.
 */
function updateDecorationsInRanges({
  decorations,
  ranges,
  editor,
  options,
  dataAttribute,
  doc,
  selection,
}: {
  decorations: DecorationSet
  ranges: Array<{ from: number; to: number }>
  editor: Editor
  options: PlaceholderOptions
  dataAttribute: string
  doc: Node
  selection: Selection
}): DecorationSet {
  let next = decorations

  for (const range of ranges) {
    const { from, to } = clampRange(range.from, range.to, doc)
    const existing = next
      .find(from, to)
      .filter(decoration => decoration.from >= from && decoration.to <= to)

    if (existing.length) {
      next = next.remove(existing)
    }

    const newDecos = scanRangeForDecorations({
      editor,
      options,
      dataAttribute,
      doc,
      selection,
      from,
      to,
    })

    if (newDecos.length) {
      next = next.add(doc, newDecos)
    }
  }

  return next
}

/**
 * Creates the incremental `StateField<DecorationSet>` used by the slow path
 * (`showOnlyCurrent: false` or `includeChildren: true`).
 *
 * Decorations are mapped through each transaction and only recomputed for
 * top-level blocks touched by document or selection changes.
 * @param options.editor - The editor instance.
 * @param options.options - The resolved placeholder options.
 * @param options.dataAttribute - The prepared `data-*` attribute name.
 * @returns A ProseMirror state field storing the placeholder decoration set.
 */
export function createPlaceholderStateField({
  editor,
  options,
  dataAttribute,
}: CreatePlaceholderStateFieldOptions): StateField<DecorationSet> {
  return {
    init(_config, state: EditorState) {
      const decorations = buildPlaceholderDecorations({
        editor,
        options,
        dataAttribute,
        doc: state.doc,
        selection: state.selection,
      })

      return decorations ?? DecorationSet.empty
    },

    apply(tr: Transaction, prev: DecorationSet, oldState: EditorState, newState: EditorState) {
      if (!tr.docChanged && !tr.selectionSet) {
        return prev
      }

      const mapped = prev.map(tr.mapping, tr.doc)
      const ranges = collectRescanRanges(tr, oldState, newState)

      return updateDecorationsInRanges({
        decorations: mapped,
        ranges,
        editor,
        options,
        dataAttribute,
        doc: newState.doc,
        selection: newState.selection,
      })
    },
  }
}
