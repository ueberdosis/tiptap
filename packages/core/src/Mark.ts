import Extension from './Extension'
import { MarkSpec } from 'prosemirror-model'

export default abstract class Mark extends Extension {

  constructor(options = {}) {
    super(options)
  }

  public extensionType = 'mark'

  abstract schema(): MarkSpec

  get type() {
    return this.editor.schema.marks[this.name]
  }

}
