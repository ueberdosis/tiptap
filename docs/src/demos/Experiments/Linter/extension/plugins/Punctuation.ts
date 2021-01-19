// @ts-nocheck
import LinterPlugin from '../LinterPlugin'

export class Punctuation extends LinterPlugin {
  public regex = / ([,.!?:]) ?/g

  fix(replacement: any) {
    return function ({ state, dispatch }) {
      dispatch(
        state.tr.replaceWith(
          this.from, this.to,
          state.schema.text(replacement),
        ),
      )
    }
  }

  scan() {
    this.doc.descendants((node, position) => {
      if (!node.isText) {
        return
      }

      const matches = this.regex.exec(node.text)

      if (matches) {
        this.record(
          'Suspicious spacing around punctuation',
          position + matches.index, position + matches.index + matches[0].length,
          this.fix(`${matches[1]} `),
        )
      }
    })

    return this
  }
}
