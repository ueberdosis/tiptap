/**
 * Drop the variation selector, so the same emoji written two ways still matches.
 */
export function removeVariationSelector(value: string): string {
  return value.replace('\u{FE0E}', '').replace('\u{FE0F}', '')
}
