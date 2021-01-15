export function getVirtualNode(node: Element) {
  return {
    getBoundingClientRect() {
      return node.getBoundingClientRect()
    },
    clientWidth: node.clientWidth,
    clientHeight: node.clientHeight,
  }
}
