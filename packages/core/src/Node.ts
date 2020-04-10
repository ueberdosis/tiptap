import Extension from './Extension'
import { NodeSpec } from 'prosemirror-model'

export default abstract class Node extends Extension {

  constructor(options = {}) {
    super(options)
  }

  public extensionType = 'node'

  public topNode = false

  abstract schema(): NodeSpec

  get type() {
    return this.editor.schema.nodes[this.name]
  }

}
