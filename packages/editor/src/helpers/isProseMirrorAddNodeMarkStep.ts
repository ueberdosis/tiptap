import { type AddNodeMarkStep } from '@tiptap/pm/transform'
import { isProseMirrorStep } from './isProseMirrorStep.js'

/**
 * Checks if a value is a ProseMirror add node mark step
 * @param value The value to check
 * @returns - A boolean, if the boolean is true the value is a ProseMirror AddNodeMarkStep
 * @example ```js
 * isProseMirrorAddNodeMarkStep(transaction.steps[0])
 * ```
 */
export function isProseMirrorAddNodeMarkStep(value: unknown): value is AddNodeMarkStep {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const step = value as Record<string, unknown>

  if (!isProseMirrorStep(step)) {
    return false
  }

  const json = step.toJSON()

  // we use the steps jsonID to check if the step is an add node mark step
  if (json === null || typeof json !== 'object' || json.stepType !== 'addNodeMark') {
    return false
  }

  return true
}
