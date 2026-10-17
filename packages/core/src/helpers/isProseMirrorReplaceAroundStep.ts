import { type ReplaceAroundStep } from '@tiptap/pm/transform'
import { isProseMirrorStep } from './isProseMirrorStep.js'

/**
 * Checks if a value is a ProseMirror replace around step
 * @param value The value to check
 * @returns - A boolean, if the boolean is true the value is a ProseMirror ReplaceAroundStep
 * @example ```js
 * isProseMirrorReplaceAroundStep(transaction.steps[0])
 * ```
 */
export function isProseMirrorReplaceAroundStep(value: unknown): value is ReplaceAroundStep {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const step = value as Record<string, unknown>

  if (!isProseMirrorStep(step)) {
    return false
  }

  const json = step.toJSON()

  // we use the steps jsonID to check if the step is a replace around step
  if (json === null || typeof json !== 'object' || json.stepType !== 'replaceAround') {
    return false
  }

  return true
}
