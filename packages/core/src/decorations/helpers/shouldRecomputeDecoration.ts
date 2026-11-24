import type { DecorationShouldUpdateProps, DecorationSpec } from '../types.js'

/**
 * Decides whether a decoration spec should be recomputed for a transaction.
 * @param spec The decoration spec to check.
 * @param props Properties containing editor, transaction, and state.
 * @param forced Whether recomputation was forced.
 * @returns `true` if the decoration should be recomputed.
 */
export function shouldRecomputeDecoration(
  spec: DecorationSpec,
  props: DecorationShouldUpdateProps,
  forced: boolean,
): boolean {
  if (forced) {
    return true
  }

  if (spec.update === 'manual') {
    return false
  }

  return spec.shouldUpdate ? spec.shouldUpdate(props) : props.tr.docChanged
}
