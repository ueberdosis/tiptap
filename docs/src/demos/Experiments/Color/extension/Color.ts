// @ts-nocheck
import { Extension } from '@tiptap/core'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { Plugin } from 'prosemirror-state'

function detectColors(doc) {
  const hexColor = /(#[0-9a-f]{3,6})\b/ig
  const results = []
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

export const Color = Extension.create({
  name: 'color',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        state: {
          init(_, { doc }) {
            return detectColors(doc)
          },
          apply(transaction, oldState) {
            return transaction.docChanged
              ? detectColors(transaction.doc)
              : oldState
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    Color: typeof Color,
  }
}
