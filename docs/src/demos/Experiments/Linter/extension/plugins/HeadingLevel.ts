// @ts-nocheck
import LinterPlugin from '../LinterPlugin'

export class HeadingLevel extends LinterPlugin {
  fixHeader(level) {
    return function ({ state, dispatch }) {
      dispatch(state.tr.setNodeMarkup(this.from - 1, null, { level }))
    }
  }

  scan() {
    let lastHeadLevel = null

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
