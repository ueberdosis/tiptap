/**
 * Preserves and restores node internals like the global process object.
 * @param operation - The operation to perform while preserving the node internals.
 * @returns The result of the operation.
 */
export function preserveAndRestoreNodeInternals<T>(operation: () => T): T {
  // Store the original process object
  // see https://github.com/ueberdosis/tiptap/issues/6368
  // eslint-disable-next-line
  const originalProcess = globalThis.process

  try {
    return operation()
  } finally {
    // Restore the original process object
    // eslint-disable-next-line
    globalThis.process = originalProcess
  }
}
