import Extension from './Extension'
import { MarkSpec } from 'prosemirror-model'

export default abstract class Mark extends Extension {

  constructor(options = {}) {
    super(options)
  }

  public type = 'mark'

  abstract schema(): MarkSpec

  get schemaType() {
    return this.editor.schema.marks[this.name]
  }

}
