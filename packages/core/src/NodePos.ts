import {
  Fragment, Node, ResolvedPos,
} from '@tiptap/pm/model'

import { Editor } from './Editor.js'
import { Content, Range } from './types.js'

export class NodePos {
  private resolvedPos: ResolvedPos

  private isBlock: boolean

  private editor: Editor

  private get name(): string {
    return this.node.type.name
  }

  constructor(pos: ResolvedPos, editor: Editor, isBlock = false, node: Node | null = null) {
    this.isBlock = isBlock
    this.resolvedPos = pos
    this.editor = editor
    this.currentNode = node
  }

  private currentNode: Node | null = null

  get node(): Node {
    return this.currentNode || this.resolvedPos.node()
  }

  get element(): HTMLElement {
    return this.editor.view.domAtPos(this.pos).node as HTMLElement
  }

  public actualDepth: number | null = null

  get depth(): number {
    return this.actualDepth ?? this.resolvedPos.depth
  }

  get pos(): number {
    return this.resolvedPos.pos
  }

  get content(): Fragment {
    return this.node.content
  }

  set content(content: Content) {
    let from = this.from
    let to = this.to

    if (this.isBlock) {
      if (this.content.size === 0) {
        console.error(`You can’t set content on a block node. Tried to set content on ${this.name} at ${this.pos}`)
        return
      }

      from = this.from + 1
      to = this.to - 1
    }

    this.editor.commands.insertContentAt({ from, to }, content)
  }

  get attributes(): { [key: string]: any } {
    return this.node.attrs
  }

  get textContent(): string {
    return this.node.textContent
  }

  get size(): number {
    return this.node.nodeSize
  }

  get from(): number {
    if (this.isBlock) {
      return this.pos
    }

    return this.resolvedPos.start(this.resolvedPos.depth)
  }

  get range(): Range {
    return {
      from: this.from,
      to: this.to,
    }
  }

  get to(): number {
    if (this.isBlock) {
      return this.pos + this.size
    }

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
    let $pos = this.resolvedPos.doc.resolve(this.from - (this.isBlock ? 1 : 2))

    if ($pos.depth !== this.depth) {
      $pos = this.resolvedPos.doc.resolve(this.from - 3)
    }

    return new NodePos($pos, this.editor)
  }

  get after(): NodePos | null {
    let $pos = this.resolvedPos.doc.resolve(this.to + (this.isBlock ? 2 : 1))

    if ($pos.depth !== this.depth) {
      $pos = this.resolvedPos.doc.resolve(this.to + 3)
    }

    return new NodePos($pos, this.editor)
  }

  get children(): NodePos[] {
    const children: NodePos[] = []

    this.node.content.forEach((node, offset) => {
      const isBlock = node.isBlock && !node.isTextblock
      const isNonTextAtom = node.isAtom && !node.isText

      const targetPos = this.pos + offset + (isNonTextAtom ? 0 : 1)
      const $pos = this.resolvedPos.doc.resolve(targetPos)

      if (!isBlock && $pos.depth <= this.depth) {
        return
      }

      const childNodePos = new NodePos($pos, this.editor, isBlock, isBlock ? node : null)

      if (isBlock) {
        childNodePos.actualDepth = this.depth + 1
      }

      children.push(new NodePos($pos, this.editor, isBlock, isBlock ? node : null))
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

    if (!this.children || this.children.length === 0) {
      return nodes
    }
    const attrKeys = Object.keys(attributes)

    /**
     * Finds all children recursively that match the selector and attributes
     * If firstItemOnly is true, it will return the first item found
     */
    this.children.forEach(childPos => {
      // If we already found a node and we only want the first item, we dont need to keep going
      if (firstItemOnly && nodes.length > 0) {
        return
      }

      if (childPos.node.type.name === selector) {
        const doesAllAttributesMatch = attrKeys.every(key => attributes[key] === childPos.node.attrs[key])

        if (doesAllAttributesMatch) {
          nodes.push(childPos)
        }
      }

      // If we already found a node and we only want the first item, we can stop here and skip the recursion
      if (firstItemOnly && nodes.length > 0) {
        return
      }

      nodes = nodes.concat(childPos.querySelectorAll(selector, attributes, firstItemOnly))
    })

    return nodes
  }

  setAttribute(attributes: { [key: string]: any }) {
    const { tr } = this.editor.state

    tr.setNodeMarkup(this.from, undefined, {
      ...this.node.attrs,
      ...attributes,
    })

    this.editor.view.dispatch(tr)
  }
}
