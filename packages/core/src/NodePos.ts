import {
  Fragment, Node, ResolvedPos,
} from '@tiptap/pm/model'

import { Editor } from './Editor.js'
import { Content, Range } from './types.js'

export class NodePos {
  private resolvedPos: ResolvedPos

  private editor: Editor

  constructor(pos: ResolvedPos, editor: Editor) {
    this.resolvedPos = pos
    this.editor = editor
  }

  get node(): Node {
    return this.resolvedPos.node()
  }

  get element(): HTMLElement {
    return this.editor.view.domAtPos(this.pos).node as HTMLElement
  }

  get depth(): number {
    return this.resolvedPos.depth
  }

  get pos(): number {
    return this.resolvedPos.pos
  }

  get content(): Fragment {
    return this.node.content
  }

  set content(content: Content) {
    this.editor.commands.insertContentAt({ from: this.from, to: this.to }, content)
  }

  get attributes() : { [key: string]: any } {
    return this.node.attrs
  }

  get textContent(): string {
    return this.node.textContent
  }

  get size(): number {
    return this.node.nodeSize
  }

  get from(): number {
    return this.resolvedPos.start(this.resolvedPos.depth)
  }

  get range(): Range {
    return {
      from: this.from,
      to: this.to,
    }
  }

  get to(): number {
    return this.resolvedPos.end(this.resolvedPos.depth) + (this.node.isText ? 0 : 1)
  }

  get parent(): NodePos | null {
    if (this.depth === 0) {
      return null
    }

    const parentPos = this.resolvedPos.start(this.resolvedPos.depth - 1)
    const $pos = this.resolvedPos.doc.resolve(parentPos)

    return new NodePos($pos, this.editor)
  }

  get before(): NodePos | null {
    let $pos = this.resolvedPos.doc.resolve(this.from - 2)

    if ($pos.depth !== this.depth) {
      $pos = this.resolvedPos.doc.resolve(this.from - 3)
    }

    return new NodePos($pos, this.editor)
  }

  get after(): NodePos | null {
    let $pos = this.resolvedPos.doc.resolve(this.to + 2)

    if ($pos.depth !== this.depth) {
      $pos = this.resolvedPos.doc.resolve(this.to + 3)
    }

    return new NodePos($pos, this.editor)
  }

  get children(): NodePos[] {
    const children: NodePos[] = []

    this.node.content.forEach((node, offset) => {
      const targetPos = this.pos + offset + 1
      const $pos = this.resolvedPos.doc.resolve(targetPos)

      if ($pos.depth === this.depth) {
        return
      }

      children.push(new NodePos($pos, this.editor))
    })

    return children
  }

  get firstChild(): NodePos | null {
    return this.children[0] || null
  }

  get lastChild(): NodePos | null {
    const children = this.children

    return children[children.length - 1] || null
  }

  closest(selector: string, attributes: { [key: string]: any } = {}): NodePos | null {
    let node: NodePos | null = null
    let currentNode = this.parent

    while (currentNode && !node) {
      if (currentNode.node.type.name === selector) {
        if (Object.keys(attributes).length > 0) {
          const nodeAttributes = currentNode.node.attrs
          const attrKeys = Object.keys(attributes)

          for (let index = 0; index < attrKeys.length; index += 1) {
            const key = attrKeys[index]

            if (nodeAttributes[key] !== attributes[key]) {
              break
            }
          }
        } else {
          node = currentNode
        }
      }

      currentNode = currentNode.parent
    }

    return node
  }

  querySelector(selector: string, attributes: { [key: string]: any } = {}): NodePos | null {
    return this.querySelectorAll(selector, attributes, true)[0] || null
  }

  querySelectorAll(selector: string, attributes: { [key: string]: any } = {}, firstItemOnly = false): NodePos[] {
    let nodes: NodePos[] = []

    // iterate through children recursively finding all nodes which match the selector with the node name
    if (!this.children || this.children.length === 0) {
      return nodes
    }

    this.children.forEach(node => {
      if (node.node.type.name === selector) {
        if (Object.keys(attributes).length > 0) {
          const nodeAttributes = node.node.attrs
          const attrKeys = Object.keys(attributes)

          for (let index = 0; index < attrKeys.length; index += 1) {
            const key = attrKeys[index]

            if (nodeAttributes[key] !== attributes[key]) {
              return
            }
          }
        }

        nodes.push(node)

        if (firstItemOnly) {
          return
        }
      }

      nodes = nodes.concat(node.querySelectorAll(selector))
    })

    return nodes
  }

  setAttribute(attributes: { [key: string]: any }) {
    const oldSelection = this.editor.state.selection

    this.editor.chain().setTextSelection(this.from).updateAttributes(this.node.type.name, attributes).setTextSelection(oldSelection.from)
      .run()
  }
}
