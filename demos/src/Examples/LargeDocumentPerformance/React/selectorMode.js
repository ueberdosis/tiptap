/**
 * Shared by every node view selector in this demo.
 *
 * When a selector returns a value that changes on selection, it changes in all
 * node views at once, and React re-renders all of them. Turning this off keeps
 * the selectors running but their results stable, which is what the editor
 * itself costs per transaction.
 */
export const selectorMode = { dependsOnSelection: true }
