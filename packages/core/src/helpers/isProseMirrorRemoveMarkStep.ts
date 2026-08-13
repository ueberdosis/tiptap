import { type RemoveMarkStep } from '@tiptap/pm/transform'
import { isProseMirrorStep } from './isProseMirrorStep.js'

/**
 * Checks if a value is a ProseMirror remove mark step
 * @param value The value to check
 * @returns - A boolean, if the boolean is true the value is a ProseMirror RemoveMarkStep
 * @example ```js
 * isProseMirrorRemoveMarkStep(transaction.steps[0])
 * ```
 */
export function isProseMirrorRemoveMarkStep(value: unknown): value is RemoveMarkStep {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const step = value as Record<string, unknown>

  if (!isProseMirrorStep(step)) {
    return false
  }

  const json = step.toJSON()

  // we use the steps jsonID to check if the step is a remove mark step
  if (json === null || typeof json !== 'object' || json.stepType !== 'removeMark') {
    return false
  }

  return true
}
