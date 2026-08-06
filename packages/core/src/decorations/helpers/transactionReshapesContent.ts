import type { Step } from '@tiptap/pm/transform'
import type { Transaction } from '@tiptap/pm/state'

/** `jsonID` is set on each step's prototype by `Step.jsonID`; not in the type defs. */
type StepWithId = Step & { jsonID?: string }

const ATTR_ONLY_STEP_IDS = new Set(['attr', 'docAttr'])
const MARK_STEP_IDS = new Set(['addMark', 'removeMark', 'addNodeMark', 'removeNodeMark'])

/**
 * checks if a step is only attribute-related (no content changes)
 *
 * @param step The step to check.
 * @returns `true` if the step is an attr-only step, `false` otherwise.
 */
function isAttrOnlyStep(step: StepWithId): boolean {
  return ATTR_ONLY_STEP_IDS.has(step.jsonID ?? '')
}

/**
 * checks if a step is only mark-related (no content changes)
 * @param step The step to check.
 * @returns `true` if the step is a mark step, `false` otherwise.
 */
function isMarkStep(step: StepWithId): boolean {
  return MARK_STEP_IDS.has(step.jsonID ?? '')
}

/**
 * checks if a transaction reshapes content (positions, content, or marks changed)
 * @param tr The transaction to check.
 * @returns `true` if positions, content, or marks changed, `false` for attr-only.
 */
export function transactionReshapesContent(tr: Transaction): boolean {
  for (const step of tr.steps) {
    if (isMarkStep(step as StepWithId)) {
      return true
    }

    if (!isAttrOnlyStep(step as StepWithId)) {
      return true
    }
  }

  return false
}
