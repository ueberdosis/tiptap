// Warn once per key per page load. apply runs on every transaction
const warnedDuplicateKeys = new Set<string>()

/**
 * Unions all widget keys from multiple extensions into a single set.
 * @param widgetKeysByExtension The widget keys to union.
 * @returns The unioned widget keys.
 */
export function unionWidgetKeys(widgetKeysByExtension: Record<string, Set<string>>): Set<string> {
  const merged = new Set<string>()
  const owners = new Map<string, string>()

  // for each extension, check if the key is already owned by another extension
  // if so, warn the user, otherwise add the key to the merged set
  for (const [name, keys] of Object.entries(widgetKeysByExtension)) {
    for (const key of keys) {
      const owner = owners.get(key)

      if (owner !== undefined) {
        if (!warnedDuplicateKeys.has(key)) {
          warnedDuplicateKeys.add(key)
          console.warn(
            `[tiptap warn]: Duplicate widget decoration key "${key}" produced by extensions ` +
              `"${owner}" and "${name}". Widget decoration keys must be globally unique across ` +
              'all extensions, otherwise ProseMirror misplaces the widget DOM. Use a stable, ' +
              'unique key (e.g. `comment-${id}`).',
          )
        }
      } else {
        owners.set(key, name)
      }

      merged.add(key)
    }
  }

  return merged
}
