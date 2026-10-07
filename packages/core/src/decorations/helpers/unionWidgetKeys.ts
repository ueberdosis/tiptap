/**
 * Unions all widget keys from multiple extensions into a single set.
 * @param widgetKeysByExtension The widget keys to union.
 * @returns The unioned widget keys.
 */
export function unionWidgetKeys(widgetKeysByExtension: Record<string, Set<string>>): Set<string> {
  const merged = new Set<string>()
  for (const keys of Object.values(widgetKeysByExtension)) {
    for (const key of keys) {
      merged.add(key)
    }
  }

  return merged
}
