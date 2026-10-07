import { type AttrStep } from '@tiptap/pm/transform'
import { isProseMirrorStep } from './isProseMirrorStep.js'

/**
 * Checks if a value is a ProseMirror attribute step
 * @param value The value to check
 * @returns - A boolean, if the boolean is true the value is a ProseMirror AttrStep
 * @example ```js
 * isProseMirrorAttrStep(transaction.steps[0])
 * ```
 */
export function isProseMirrorAttrStep(value: unknown): value is AttrStep {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const step = value as Record<string, unknown>

  if (!isProseMirrorStep(step)) {
    return false
  }

  const json = step.toJSON()

  // we use the steps jsonID to check if the step is an attribute step
  if (json === null || typeof json !== 'object' || json.stepType !== 'attr') {
    return false
  }

  return true
}
