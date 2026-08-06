import {
  AddMarkStep,
  AddNodeMarkStep,
  AttrStep,
  DocAttrStep,
  RemoveMarkStep,
  RemoveNodeMarkStep,
  ReplaceAroundStep,
} from '@tiptap/pm/transform'
import type { Step } from '@tiptap/pm/transform'
import type { Transaction } from '@tiptap/pm/state'

/**
 * Checks whether a step only changes node attributes without touching
 * content, marks, or positions. `AttrStep` and `DocAttrStep` are always
 * attr-only. `ReplaceAroundStep` with an identity map (e.g. `setNodeMarkup`
 * that preserves the gap content) is also attr-only.
 */
function isAttrOnlyStep(step: Step): boolean {
  if (step instanceof AttrStep || step instanceof DocAttrStep) {
    return true
  }

  if (step instanceof ReplaceAroundStep) {
    let identity = true

    step.getMap().forEach((oldStart, oldEnd, newStart, newEnd) => {
      if (oldEnd - oldStart !== newEnd - newStart) {
        identity = false
      }
    })

    return identity
  }

  return false
}

function isMarkStep(step: Step): boolean {
  return (
    step instanceof AddMarkStep ||
    step instanceof RemoveMarkStep ||
    step instanceof AddNodeMarkStep ||
    step instanceof RemoveNodeMarkStep
  )
}

/**
 * Checks whether a transaction changes anything decorations might depend on
 * (positions, content, or marks), as opposed to attribute-only changes.
 *
 * Attr-only transactions (e.g. UniqueID assigning an `id` via
 * `setNodeMarkup`) produce identity mappings and no mark steps, so the
 * existing decoration set can be mapped forward without recomputing.
 *
 * @param tr The transaction to inspect.
 * @returns `true` if positions, content, or marks changed, `false` for attr-only.
 */
export function transactionReshapesContent(tr: Transaction): boolean {
  for (const step of tr.steps) {
    if (isMarkStep(step)) {
      return true
    }

    if (!isAttrOnlyStep(step)) {
      return true
    }
  }

  return false
}
