import type { Node } from 'prosemirror-model'
import type { Step } from 'prosemirror-transform'

export const isNodeMarkupChange = (step: Step, before: Node, after: Node, position: number) => {
  const json = step.toJSON()

  if (json.stepType !== 'replace' && json.stepType !== 'replaceAround') {
    return false
  }

  if (position !== json.from && position !== json.to - 1) {
    return false
  }

  const source = before.nodeAt(json.from)
  const target = after.nodeAt(json.from)

  if (!source || !target) {
    return false
  }

  if (source.nodeSize !== json.to - json.from) {
    return false
  }

  return changedMarkup(source, target)
}

const changedMarkup = (source: Node, target: Node) =>
  source.type === target.type && source.content.eq(target.content) && !source.sameMarkup(target)
