import { type AddMarkStep } from '@tiptap/pm/transform'
import { isProseMirrorStep } from './isProseMirrorStep.js'

/**
 * Checks if a value is a ProseMirror add mark step
 * @param value The value to check
 * @returns - A boolean, if the boolean is true the value is a ProseMirror AddMarkStep
 * @example ```js
 * isProseMirrorAddMarkStep(transaction.steps[0])
 * ```
 */
export function isProseMirrorAddMarkStep(value: unknown): value is AddMarkStep {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const step = value as Record<string, unknown>

  if (!isProseMirrorStep(step)) {
    return false
  }

  const json = step.toJSON()

  // we use the steps jsonID to check if the step is an add mark step
  if (json === null || typeof json !== 'object' || json.stepType !== 'addMark') {
    return false
  }

  return true
}
