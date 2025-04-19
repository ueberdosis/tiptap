export function mergeMaps<Key = unknown, Value = unknown>(target: Map<Key, Value>, source: Map<Key, Value>): Map<Key, Value> {
  const result = new Map(target)

  for (const [key, value] of source) {
    result.set(key, value)
  }

  return result
}

