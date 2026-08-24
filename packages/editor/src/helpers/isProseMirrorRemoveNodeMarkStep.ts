import { type RemoveNodeMarkStep } from '@tiptap/pm/transform'
import { isProseMirrorStep } from './isProseMirrorStep.js'

/**
 * Checks if a value is a ProseMirror remove node mark step
 * @param value The value to check
 * @returns - A boolean, if the boolean is true the value is a ProseMirror RemoveNodeMarkStep
 * @example ```js
 * isProseMirrorRemoveNodeMarkStep(transaction.steps[0])
 * ```
 */
export function isProseMirrorRemoveNodeMarkStep(value: unknown): value is RemoveNodeMarkStep {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const step = value as Record<string, unknown>

  if (!isProseMirrorStep(step)) {
    return false
  }

  const json = step.toJSON()

  // we use the steps jsonID to check if the step is a remove node mark step
  if (json === null || typeof json !== 'object' || json.stepType !== 'removeNodeMark') {
    return false
  }

  return true
}
