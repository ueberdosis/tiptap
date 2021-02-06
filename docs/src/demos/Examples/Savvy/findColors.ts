import { Decoration, DecorationSet } from 'prosemirror-view'
import { Node } from 'prosemirror-model'

export default function (doc: Node): DecorationSet {
  const hexColor = /(#[0-9a-f]{3,6})\b/ig
  const results: {
    color: string,
    from: number,
    to: number,
  }[] = []
  const decorations: Decoration[] = []

  doc.descendants((node, position) => {
    if (!node.text) {
      return
    }

    [...node.text.matchAll(hexColor)].forEach(match => {
      const index = match.index || 0

      results.push({
        color: match[0],
        from: position + index,
        to: position + index + match[0].length,
      })
    })
  })

  results.forEach(issue => {
    decorations.push(Decoration.inline(issue.from, issue.to, {
      class: 'color',
      style: `--color: ${issue.color}`,
    }))
  })

  return DecorationSet.create(doc, decorations)
}
