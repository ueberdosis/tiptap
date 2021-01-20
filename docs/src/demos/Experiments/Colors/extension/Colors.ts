// @ts-nocheck
import { Extension } from '@tiptap/core'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { Plugin } from 'prosemirror-state'

function detectColors(doc) {
  const hexColors = /(#[0-9a-f]{3,6})\b/ig
  const rgbaColors = /(rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\))\b/ig
  const results = []
  const decorations: [any?] = []

  doc.descendants((node: any, position: any) => {
    if (!node.isText) {
      return
    }

    let matches

    // eslint-disable-next-line
    while (matches = hexColors.exec(node.text)) {
      results.push({
        color: matches[0],
        from: position + matches.index,
        to: position + matches.index + matches[0].length,
      })
    }

    // eslint-disable-next-line
    while (matches = rgbaColors.exec(node.text)) {
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

export const Colors = Extension.create({
  name: 'colors',

  addProseMirrorPlugins() {
    const { plugins } = this.options

    return [
      new Plugin({
        state: {
          init(_, { doc }) {
            return detectColors(doc, plugins)
          },
          apply(transaction, oldState) {
            return transaction.docChanged
              ? detectColors(transaction.doc, plugins)
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
    Colors: typeof Colors,
  }
}
