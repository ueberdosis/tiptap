import Extension from './Extension'

export default abstract class Mark extends Extension {

  constructor(options = {}) {
    super(options)
  }

  public type = 'mark'

  schema(): any {
    return null
  }

  get schemaType() {
    return this.editor.schema.marks[this.name]
  }

}
