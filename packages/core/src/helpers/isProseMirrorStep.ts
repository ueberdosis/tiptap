import { type Step } from '@tiptap/pm/transform'

/**
 * Checks if a value is a ProseMirror step
 * @param value The value to check
 * @returns - A boolean, if the boolean is true the value is a ProseMirror Step
 * @example ```js
 * isProseMirrorStep(transaction.steps[0])
 * ```
 */
export function isProseMirrorStep(value: unknown): value is Step {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const step = value as Record<string, unknown>

  if (
    typeof step.apply !== 'function' ||
    typeof step.getMap !== 'function' ||
    typeof step.invert !== 'function' ||
    typeof step.map !== 'function' ||
    typeof step.merge !== 'function' ||
    typeof step.toJSON !== 'function'
  ) {
    return false
  }

  return true
}
