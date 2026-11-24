import type { DecorationSpec } from '../types.js'

/**
 * Validates a decoration spec to ensure it follows the correct pattern for its update strategy.
 * @param name The name of the extension.
 * @param spec The decoration spec to validate
 */
export function validateDecorationSpec(name: string, spec: DecorationSpec): void {
  const strategy = (spec as DecorationSpec & { update?: unknown }).update ?? 'document'

  switch (strategy) {
    case 'document':
      if (spec.createInRange) {
        throw new Error(
          `[tiptap error]: Extension "${name}" provides createInRange() but does not use the ` +
            '"changedRanges" decoration update strategy.',
        )
      }
      return
    case 'changedRanges':
      if (!spec.createInRange) {
        throw new Error(
          `[tiptap error]: Extension "${name}" uses the "changedRanges" decoration update ` +
            'strategy but does not provide createInRange().',
        )
      }
      return
    case 'manual':
      if (spec.createInRange) {
        throw new Error(
          `[tiptap error]: Extension "${name}" uses the "manual" decoration update strategy, ` +
            'which is not compatible with createInRange(). createInRange() requires the ' +
            '"changedRanges" strategy.',
        )
      }
      if (spec.shouldUpdate) {
        throw new Error(
          `[tiptap error]: Extension "${name}" cannot combine the "manual" decoration update ` +
            'strategy with shouldUpdate().',
        )
      }
      return
    default:
      throw new Error(
        `[tiptap error]: Extension "${name}" uses an unknown decoration update strategy. ` +
          'Expected "document", "changedRanges", or "manual".',
      )
  }
}
