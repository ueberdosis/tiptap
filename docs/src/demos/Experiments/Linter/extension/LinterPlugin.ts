import { Node as ProsemirrorNode } from 'prosemirror-model'

export interface Result {
  message: string,
  from: number,
  to: number,
  fix?: Function
}

export default class LinterPlugin {
  protected doc

  private results: Array<Result> = []

  constructor(doc: ProsemirrorNode) {
    this.doc = doc
  }

  record(message: string, from: number, to: number, fix?: Function) {
    this.results.push({
      message,
      from,
      to,
      fix,
    })
  }

  scan() {
    return this
  }

  getResults() {
    return this.results
  }
}
