import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { Node as ProsemirrorNode } from 'prosemirror-model'
import low from 'lowlight/lib/core'
import { findChildren } from '@tiptap/core'

function parseNodes(nodes: any[], className: string[] = []): { text: string, classes: string[] }[] {
  return nodes
    .map(node => {
      const classes = [
        ...className,
        ...node.properties
          ? node.properties.className
          : [],
      ]

      if (node.children) {
        return parseNodes(node.children, classes)
      }

      return {
        text: node.value,
        classes,
      }
    })
    .flat()
}

function getDecorations({ doc, name }: { doc: ProsemirrorNode, name: string}) {
  const decorations: Decoration[] = []

  findChildren(doc, node => node.type.name === name)
    .forEach(block => {
      let startPos = block.pos + 1
      const { language } = block.node.attrs
      // TODO: add missing type for `listLanguages`
      // @ts-ignore
      const languages = low.listLanguages() as string[]
      const nodes = language && languages.includes(language)
        ? low.highlight(language, block.node.textContent).value
        : low.highlightAuto(block.node.textContent).value

      parseNodes(nodes).forEach(node => {
        const from = startPos
        const to = from + node.text.length

        startPos = to

        const decoration = Decoration.inline(from, to, {
          class: node.classes.join(' '),
        })

        decorations.push(decoration)
      })
    })

  return DecorationSet.create(doc, decorations)
}

export function LowlightPlugin({ name }: { name: string }) {
  return new Plugin({
    key: new PluginKey('highlight'),

    state: {
      init: (_, { doc }) => getDecorations({ doc, name }),
      apply: (transaction, decorationSet, oldState, newState) => {
        // TODO: find way to cache decorations
        // https://discuss.prosemirror.net/t/how-to-update-multiple-inline-decorations-on-node-change/1493
        const oldNodeName = oldState.selection.$head.parent.type.name
        const newNodeName = newState.selection.$head.parent.type.name
        const oldNodes = findChildren(oldState.doc, node => node.type.name === name)
        const newNodes = findChildren(newState.doc, node => node.type.name === name)

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
