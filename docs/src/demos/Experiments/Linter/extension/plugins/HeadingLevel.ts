import { EditorView } from 'prosemirror-view'
import LinterPlugin, { Result as Issue } from '../LinterPlugin'

export class HeadingLevel extends LinterPlugin {
  fixHeader(level: number) {
    return function ({ state, dispatch }: EditorView, issue: Issue) {
      dispatch(state.tr.setNodeMarkup(issue.from - 1, undefined, { level }))
    }
  }

  scan() {
    let lastHeadLevel: number | null = null

    this.doc.descendants((node, position) => {
      if (node.type.name === 'heading') {
        // Check whether heading levels fit under the current level
        const { level } = node.attrs

        if (lastHeadLevel != null && level > lastHeadLevel + 1) {
          this.record(`Heading too small (${level} under ${lastHeadLevel})`,
            position + 1, position + 1 + node.content.size,
            this.fixHeader(lastHeadLevel + 1))
        }
        lastHeadLevel = level
      }
    })

    return this
  }
}
