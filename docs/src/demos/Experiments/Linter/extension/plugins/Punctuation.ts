import { EditorView } from 'prosemirror-view'
import LinterPlugin, { Result as Issue } from '../LinterPlugin'

export class Punctuation extends LinterPlugin {
  public regex = / ([,.!?:]) ?/g

  fix(replacement: any) {
    return function ({ state, dispatch }: EditorView, issue: Issue) {
      dispatch(
        state.tr.replaceWith(
          issue.from, issue.to,
          state.schema.text(replacement),
        ),
      )
    }
  }

  scan() {
    this.doc.descendants((node, position) => {
      if (!node.isText) return

      if (!node.text) return

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
