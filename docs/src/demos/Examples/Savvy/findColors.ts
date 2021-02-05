import { Decoration, DecorationSet } from 'prosemirror-view'
import { Node } from 'prosemirror-model'

export default function (doc: Node) {
  const hexColor = /(#[0-9a-f]{3,6})\b/ig
  const results: any[] = []
  const decorations: [any?] = []

  doc.descendants((node: any, position: any) => {
    if (!node.isText) {
      return
    }

    let matches

    // eslint-disable-next-line
    while (matches = hexColor.exec(node.text)) {
      results.push({
        color: matches[0],
        from: position + matches.index,
        to: position + matches.index + matches[0].length,
      })
    }
  })

  results.forEach(issue => {
    decorations.push(Decoration.inline(issue.from, issue.to, {
      class: 'color',
      style: `--color: ${issue.color}`,
    }))
  })

  return DecorationSet.create(doc, decorations)
}
