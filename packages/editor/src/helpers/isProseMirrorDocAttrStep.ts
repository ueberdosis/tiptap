import { type DocAttrStep } from '@tiptap/pm/transform'
import { isProseMirrorStep } from './isProseMirrorStep.js'

/**
 * Checks if a value is a ProseMirror document attribute step
 * @param value The value to check
 * @returns - A boolean, if the boolean is true the value is a ProseMirror DocAttrStep
 * @example ```js
 * isProseMirrorDocAttrStep(transaction.steps[0])
 * ```
 */
export function isProseMirrorDocAttrStep(value: unknown): value is DocAttrStep {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const step = value as Record<string, unknown>

  if (!isProseMirrorStep(step)) {
    return false
  }

  const json = step.toJSON()

  // we use the steps jsonID to check if the step is a document attribute step
  if (json === null || typeof json !== 'object' || json.stepType !== 'docAttr') {
    return false
  }

  return true
}
