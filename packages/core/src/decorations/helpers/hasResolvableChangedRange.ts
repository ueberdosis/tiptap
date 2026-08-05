import { AttrStep } from '@tiptap/pm/transform'
import type { Step } from '@tiptap/pm/transform'

/**
 * Check if a step has a resolvable changed range.
 * @param step The step to check.
 * @returns True if the step has a resolvable changed range, false otherwise.
 */
export function hasResolvableChangedRange(step: Step): boolean {
  let hasMappedRange = false

  step.getMap().forEach(() => {
    hasMappedRange = true
  })

  if (hasMappedRange || step instanceof AttrStep) {
    return true
  }

  const positionalStep = step as Step & { from?: unknown; to?: unknown }

  return typeof positionalStep.from === 'number' && typeof positionalStep.to === 'number'
}
