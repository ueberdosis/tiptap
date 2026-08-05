/**
 * Delete the node that was dragged away.
 */
export function removeNode(node: HTMLElement) {
  node.parentNode?.removeChild(node)
}
