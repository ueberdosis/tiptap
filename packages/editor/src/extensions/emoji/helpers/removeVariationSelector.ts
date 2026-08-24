export function removeVariationSelector(value: string): string {
  return value.replace('\u{FE0E}', '').replace('\u{FE0F}', '')
}
