import { Plugin, PluginKey } from 'tiptap'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { findBlockNodes } from 'tiptap-utils'
import low from 'lowlight/lib/core'

function getDecorations({ doc, name }) {
  const decorations = []
  const blocks = findBlockNodes(doc).filter(item => item.node.type.name === name)
  const flatten = list => list.reduce(
    (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), [],
  )

  function parseNodes(nodes, className = []) {
    return nodes.map(node => {

      const classes = [
        ...className,
        ...node.properties ? node.properties.className : [],
      ]

      if (node.children) {
        return parseNodes(node.children, classes)
      }

      return {
        text: node.value,
        classes,
      }
    })
  }

  blocks.forEach(block => {
    let startPos = block.pos + 1
    const nodes = low.highlightAuto(block.node.textContent).value

    flatten(parseNodes(nodes))
      .map(node => {
        const from = startPos
        const to = from + node.text.length

        startPos = to

        return {
          ...node,
          from,
          to,
        }
      })
      .forEach(node => {
        if (node.classes.length === 0) {
          // Do not emit empty decorations.
          return
        }

        const decoration = Decoration.inline(node.from, node.to, {
          class: node.classes.join(' '),
        })
        decorations.push(decoration)
      })
  })

  return DecorationSet.create(doc, decorations)
}

export default function HighlightPlugin({ name }) {
  return new Plugin({
    name: new PluginKey('highlight'),
    state: {
      init: (_, { doc }) => getDecorations({ doc, name }),
      apply: (transaction, decorationSet, oldState, newState) => {
        // TODO: find way to cache decorations
        // https://discuss.prosemirror.net/t/how-to-update-multiple-inline-decorations-on-node-change/1493
        const oldNodeName = oldState.selection.$head.parent.type.name
        const newNodeName = newState.selection.$head.parent.type.name
        const oldNodes = findBlockNodes(oldState.doc)
          .filter(item => item.node.type.name === name)
        const newNodes = findBlockNodes(newState.doc)
          .filter(item => item.node.type.name === name)
        // Apply decorations if selection includes named node, or transaction changes named node.
        if (transaction.docChanged && ([oldNodeName, newNodeName].includes(name)
          || newNodes.length !== oldNodes.length)) {
          return getDecorations({ doc: transaction.doc, name })
        }
        return decorationSet.map(transaction.mapping, transaction.doc)
      },
    },
    props: {
      decorations(state) {
        return this.getState(state)
      },
    },
  })
}
