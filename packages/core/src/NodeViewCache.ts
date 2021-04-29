export default class NodeViewCache {

  data: any[]

  constructor() {
    this.data = []
  }

  add(data: any) {
    const item = {
      ...data,
      id: this.generateId(),
    }

    this.data.push(item)
    return item
  }

  findById(id: any) {
    const index = this.data.findIndex(item => item.id === id)
    return this.removeIndex(index)
  }

  findByNode(node: any) {
    const index = this.data.findIndex(item => JSON.stringify(node) === JSON.stringify(item.instance.node))
    return this.removeIndex(index)
  }

  findByNodeAndPosition(node: any, pos: any) {
    const index = this.data.findIndex(item => {
      return JSON.stringify(node) === JSON.stringify(item.instance.node)
        && pos === item.instance.position
        // && item.instance.isSame
    })
    return this.removeIndex(index)
  }

  removeIndex(index: any) {
    if (index < 0) {
      return null
    }

    const item = this.data[index]

    this.data = [
      ...this.data.slice(0, index),
      ...this.data.slice(index + 1),
    ]

    return item
  }

  generateId() {
    return Math.floor(Math.random() * 0xFFFFFFFF)
  }

}
