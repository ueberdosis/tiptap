/**
 * Tracks which editors are running decoration create() callbacks inside state.apply,
 * using a private WeakMap to keep this off the public Editor surface.
 */
const depthByEditor = new WeakMap<object, number>()

/**
 * Marks callback as decoration-apply work for editor, so editor.state can warn
 * about stale reads. Counts depth to handle nested applies.
 *
 * @param editor The editor the decorations belong to
 * @param callback The work to run inside the scope
 * @returns Whatever `callback` returns
 * @example
 * runInDecorationApplyScope(editor, () => spec.create({ editor, state, view }))
 */
export function runInDecorationApplyScope<T>(editor: object, callback: () => T): T {
  depthByEditor.set(editor, (depthByEditor.get(editor) ?? 0) + 1)

  try {
    return callback()
  } finally {
    const remaining = (depthByEditor.get(editor) ?? 1) - 1

    if (remaining > 0) {
      depthByEditor.set(editor, remaining)
    } else {
      depthByEditor.delete(editor)
    }
  }
}

/**
 * Whether the editor is currently inside a decoration apply scope.
 *
 * @param editor The editor to check
 * @returns `true` while decoration create() callbacks run
 * @example
 * if (isInDecorationApplyScope(editor)) {
 *   // reads of editor.state are stale here
 * }
 */
export function isInDecorationApplyScope(editor: object): boolean {
  return depthByEditor.has(editor)
}
