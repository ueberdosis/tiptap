import { type ReplaceStep } from '@tiptap/pm/transform'
import { isProseMirrorStep } from './isProseMirrorStep.js'

/**
 * Checks if a value is a ProseMirror replace step result
 * @param value The value to check
 * @returns - A boolean, if the boolean is true the value is a ProseMirror ReplaceStep
 * @example ```js
 * isProseMirrorReplaceStep(transaction.steps[0])
 * ```
 */
export function isProseMirrorReplaceStep(value: unknown): value is ReplaceStep {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const step = value as Record<string, unknown>

  if (!isProseMirrorStep(step)) {
    return false
  }

  const json = step.toJSON()

  // we use the steps jsonID to check if the step is a replace step
  if (json === null || typeof json !== 'object' || json.stepType !== 'replace') {
    return false
  }

  return true
}
