export class AnnotationItem {
  private decoration!: any

  constructor(decoration: any) {
    this.decoration = decoration
  }

  get id() {
    return this.decoration.type.spec.id
  }

  get from() {
    return this.decoration.from
  }

  get to() {
    return this.decoration.to
  }

  get content() {
    return this.decoration.type.spec.content
  }

  get HTMLAttributes() {
    return this.decoration.type.attrs
  }

  toString() {
    return JSON.stringify({
      id: this.id,
      content: this.content,
      from: this.from,
      to: this.to,
      HTMLAttributes: this.HTMLAttributes,
    })
  }
}
