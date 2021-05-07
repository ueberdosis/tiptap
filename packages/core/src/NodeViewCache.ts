import { Node as ProseMirrorNode } from 'prosemirror-model'

export type NodeViewCacheItem = {
  instance: any,
  id: string,
}

export default class NodeViewCache {
  data: NodeViewCacheItem[] = []

  generateId(): string {
    return Math.floor(Math.random() * 0xFFFFFFFF).toString()
  }

  add(instance: any): NodeViewCacheItem {
    const id = this.generateId()
    const item: NodeViewCacheItem = {
      id,
      instance,
    }

    this.data.push(item)

    return item
  }

  get(id: string): NodeViewCacheItem | undefined {
    return this.data.find(item => item.id === id)
  }

  remove(id: string): void {
    this.data = this.data.filter(item => item.id !== id)
  }

  findNodeAtPosition(node: ProseMirrorNode, position: number): NodeViewCacheItem | undefined {
    return this.data.find(item => {
      const isSameNode = node === item.instance.node
      const isSamePosition = position === item.instance.position
      const isSame = !item.instance.deletedPosition

      return isSameNode && isSamePosition && isSame
    })
  }
}
