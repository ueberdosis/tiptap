import { type StepResult } from '@tiptap/pm/transform'

/**
 * Checks if a value is a ProseMirror step result
 * @param value The value to check
 * @returns - A boolean, if the boolean is true the value is a ProseMirror StepResult
 * @example ```js
 * isProseMirrorStepResult(step.apply(editor.state.doc))
 * ```
 */
export function isProseMirrorStepResult(value: unknown): value is StepResult {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const result = value as Record<string, unknown>

  const isValidDoc = result.doc !== null && typeof result.doc === 'object' && result.failed === null
  const isValidFailed = typeof result.failed === 'string' && result.doc === null

  if (!isValidDoc && !isValidFailed) {
    return false
  }

  return true
}
