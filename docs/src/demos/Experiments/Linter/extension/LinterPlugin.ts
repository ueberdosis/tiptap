interface Result {
  message: string,
  from: number,
  to: number,
  fix?: null
}

export default class LinterPlugin {
  protected doc

  private results: Array<Result> = []

  constructor(doc: any) {
    this.doc = doc
  }

  record(message: string, from: number, to: number, fix?: null) {
    this.results.push({
      message,
      from,
      to,
      fix,
    })
  }

  getResults() {
    return this.results
  }
}
