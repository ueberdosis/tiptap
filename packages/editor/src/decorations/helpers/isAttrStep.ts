import type { Step } from '@tiptap/pm/transform'

/** `jsonID` is set on each step's prototype by `Step.jsonID`; not in the type defs. */
type StepWithId = Step & { jsonID?: string }

/**
 * Whether a step only sets a node attribute.
 *
 * Matched by `jsonID` rather than `instanceof`, which fails when two copies of
 * prosemirror-transform are loaded.
 *
 * @param step The step to check.
 * @returns `true` for an `AttrStep`, which carries the target node's position.
 * @example
 * if (isAttrStep(step)) {
 *   rebuildBlockAt(step.pos)
 * }
 */
export function isAttrStep(step: Step): step is Step & { pos: number } {
  return (step as StepWithId).jsonID === 'attr'
}
