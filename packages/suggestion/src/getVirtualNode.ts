export interface VirtualNode {
  getBoundingClientRect: () => DOMRect,
  clientWidth: number,
  clientHeight: number,
}

export function getVirtualNode(node: Element): VirtualNode {
  return {
    getBoundingClientRect() {
      return node.getBoundingClientRect()
    },
    clientWidth: node.clientWidth,
    clientHeight: node.clientHeight,
  }
}
