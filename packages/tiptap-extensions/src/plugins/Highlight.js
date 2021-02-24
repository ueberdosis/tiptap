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

        if (
          transaction.docChanged
          // Apply decorations if:
          && (
            // selection includes named node,
            [oldNodeName, newNodeName].includes(name)
            // OR transaction adds/removes named node,
            || newNodes.length !== oldNodes.length
            // OR transaction has changes that completely encapsulte a node
            // (for example, a transaction that affects the entire document).
            // Such transactions can happen during collab syncing via y-prosemirror, for example.
            || transaction.steps.some(s => s.from !== undefined && s.to !== undefined
                && oldNodes.some(n => n.pos >= s.from && n.pos + n.node.nodeSize <= s.to))
          )
        ) {
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
