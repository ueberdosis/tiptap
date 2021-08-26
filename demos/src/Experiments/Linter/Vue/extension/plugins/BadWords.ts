import LinterPlugin from '../LinterPlugin'

export class BadWords extends LinterPlugin {

  public regex = /\b(obviously|clearly|evidently|simply)\b/ig

  scan() {
    this.doc.descendants((node: any, position: number) => {
      if (!node.isText) {
        return
      }

      const matches = this.regex.exec(node.text)

      if (matches) {
        this.record(
          `Try not to say '${matches[0]}'`,
          position + matches.index, position + matches.index + matches[0].length,
        )
      }
    })

    return this
  }
}
