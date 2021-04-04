import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { Node as ProsemirrorNode } from 'prosemirror-model'
import { findChildren } from '@tiptap/core'
import lowlight from 'lowlight/lib/core'

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
      let from = block.pos + 1
      const { language } = block.node.attrs
      // TODO: add missing type for `listLanguages`
      // @ts-ignore
      const languages = lowlight.listLanguages() as string[]
      const nodes = language && languages.includes(language)
        ? lowlight.highlight(language, block.node.textContent).value
        : lowlight.highlightAuto(block.node.textContent).value

      parseNodes(nodes).forEach(node => {
        const to = from + node.text.length
        const decoration = Decoration.inline(from, to, {
          class: node.classes.join(' '),
        })

        decorations.push(decoration)

        from = to
      })
    })

  return DecorationSet.create(doc, decorations)
}

export function LowlightPlugin({ name }: { name: string }) {
  return new Plugin({
    key: new PluginKey('lowlight'),

    state: {
      init: (_, { doc }) => getDecorations({ doc, name }),
      apply: (transaction, decorationSet, oldState, newState) => {
        const oldNodeName = oldState.selection.$head.parent.type.name
        const newNodeName = newState.selection.$head.parent.type.name
        const oldNodes = findChildren(oldState.doc, node => node.type.name === name)
        const newNodes = findChildren(newState.doc, node => node.type.name === name)

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
            || transaction.steps.some(step => {
              // @ts-ignore
              return step.from !== undefined
                // @ts-ignore
                && step.to !== undefined
                && oldNodes.some(node => {
                  // @ts-ignore
                  return node.pos >= step.from
                    // @ts-ignore
                    && node.pos + node.node.nodeSize <= step.to
                })
            })
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
