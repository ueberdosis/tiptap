/**
 * Derived from prosemirror-view's `src/decoration.ts` (MIT, Copyright (C)
 * 2015-2017 by Marijn Haverbeke and others): `DecorationGroup` and
 * `viewDecorations()`, reduced to what the React renderer needs to compute
 * the decoration source for the current state. Semantics track the pinned
 * prosemirror-view 1.41.9 so `eq` comparisons against base-computed sources
 * hold (see AUDIT.md).
 */
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Mapping } from '@tiptap/pm/transform'
import type { Decoration, DecorationSource, EditorView } from '@tiptap/pm/view'
import { DecorationSet } from '@tiptap/pm/view'

import { sourceEq, sourceLocals } from './internals.js'

const byPos = (a: Decoration, b: Decoration): number => a.from - b.from || a.to - b.to

/**
 * Splits partially overlapping spans so the result is sorted and
 * overlap-free, like `DecorationSet.locals()` guarantees for its own output.
 */
const removeOverlap = (spans: readonly Decoration[]): Decoration[] => {
  let working = spans as Decoration[]

  for (let i = 0; i < working.length - 1; i += 1) {
    const span = working[i]

    if (span.from === span.to) {
      continue
    }
    for (let j = i + 1; j < working.length; j += 1) {
      const next = working[j]

      if (next.from === span.from) {
        if (next.to !== span.to) {
          if (working === spans) {
            working = spans.slice()
          }
          // Followed by a partially overlapping larger span: split it
          working[j] = copySpan(next, next.from, span.to)
          insertAhead(working, j + 1, copySpan(next, span.to, next.to))
        }
        continue
      }
      if (next.from < span.to) {
        if (working === spans) {
          working = spans.slice()
        }
        // This span's end overlaps a later span: split this one
        working[i] = copySpan(span, span.from, next.from)
        insertAhead(working, j, copySpan(span, next.from, span.to))
      }
      break
    }
  }
  return working
}

// Decoration.copy is @internal but stable in 1.41.9 (returns the same
// decoration type over a new range)
const copySpan = (span: Decoration, from: number, to: number): Decoration =>
  (span as unknown as { copy(from: number, to: number): Decoration }).copy(from, to)

const insertAhead = (array: Decoration[], index: number, deco: Decoration): void => {
  let i = index

  while (i < array.length && byPos(deco, array[i]) > 0) {
    i += 1
  }
  array.splice(i, 0, deco)
}

/**
 * Presents several decoration sources as one. Mirrors prosemirror-view's
 * `DecorationGroup` so `eq()` against a base-built group holds when the
 * member sets are equal and in the same order.
 */
export class DecorationSourceGroup implements DecorationSource {
  constructor(readonly members: readonly DecorationSource[]) {}

  static from(members: readonly DecorationSource[]): DecorationSource {
    switch (members.length) {
      case 0:
        return DecorationSet.empty
      case 1:
        return members[0]
      default:
        return new DecorationSourceGroup(members)
    }
  }

  map(mapping: Mapping, doc: ProseMirrorNode): DecorationSource {
    return DecorationSourceGroup.from(this.members.map(member => member.map(mapping, doc)))
  }

  forChild(offset: number, child: ProseMirrorNode): DecorationSource {
    if (child.isLeaf) {
      return DecorationSet.empty
    }
    const found: DecorationSource[] = []

    this.members.forEach(member => {
      const result = member.forChild(offset, child)

      if (result === DecorationSet.empty) {
        return
      }
      if (result instanceof DecorationSourceGroup) {
        found.push(...result.members)
      } else {
        found.push(result)
      }
    })
    return DecorationSourceGroup.from(found)
  }

  eq(other: DecorationSource): boolean {
    const otherMembers = (other as DecorationSourceGroup).members

    if (!Array.isArray(otherMembers) || otherMembers.length !== this.members.length) {
      return false
    }
    return this.members.every((member, i) => sourceEq(member, otherMembers[i]))
  }

  locals(node: ProseMirrorNode): readonly Decoration[] {
    const collected: Decoration[] = []

    this.members.forEach(member => {
      collected.push(...sourceLocals(member, node))
    })
    if (this.members.length < 2 || collected.length < 2) {
      return collected
    }
    // Each member's locals are already sorted and overlap-free; merging
    // members can reintroduce both
    return removeOverlap(collected.sort(byPos))
  }

  forEachSet(callback: (set: DecorationSet) => void): void {
    this.members.forEach(member => member.forEachSet(callback))
  }
}

/**
 * The decoration source for a state: every plugin's (and the direct props')
 * `decorations` prop, combined. The React equivalent of prosemirror-view's
 * module-private `viewDecorations()`, minus the cursor wrapper (composition
 * rendering is a later phase). Takes the state explicitly because the
 * rendered state can lag `view.state` while a composition defers re-renders.
 */
export const viewDecorations = (view: EditorView, state = view.state): DecorationSource => {
  const found: DecorationSource[] = []

  view.someProp('decorations', f => {
    const result = f(state)

    if (result && result !== DecorationSet.empty) {
      found.push(result)
    }
    // Keep collecting from every plugin
    return undefined
  })
  return DecorationSourceGroup.from(found)
}
