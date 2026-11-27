import { findChildren, getChangedRanges } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import type { Transaction } from '@tiptap/pm/state'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
// @ts-ignore
import highlight from 'highlight.js/lib/core'

function parseNodes(nodes: any[], className: string[] = []): { text: string; classes: string[] }[] {
  return nodes.flatMap(node => {
    const classes = [...className, ...(node.properties ? node.properties.className : [])]

    if (node.children) {
      return parseNodes(node.children, classes)
    }

    return {
      text: node.value,
      classes,
    }
  })
}

function getHighlightNodes(result: any) {
  // `.value` for lowlight v1, `.children` for lowlight v2
  return result.value || result.children || []
}

function registered(aliasOrLanguage: string) {
  return Boolean(highlight.getLanguage(aliasOrLanguage))
}

function getDecorations({
  doc,
  name,
  lowlight,
  defaultLanguage,
}: {
  doc: ProsemirrorNode
  name: string
  lowlight: any
  defaultLanguage: string | null | undefined
}) {
  const decorations: Decoration[] = []

  findChildren(doc, node => node.type.name === name).forEach(block => {
    let from = block.pos + 1
    const language = block.node.attrs.language || defaultLanguage
    const languages = lowlight.listLanguages()

    const nodes =
      language &&
      (languages.includes(language) || registered(language) || lowlight.registered?.(language))
        ? getHighlightNodes(lowlight.highlight(language, block.node.textContent))
        : getHighlightNodes(lowlight.highlightAuto(block.node.textContent))

    parseNodes(nodes).forEach(node => {
      const to = from + node.text.length

      if (node.classes.length) {
        const decoration = Decoration.inline(from, to, {
          class: node.classes.join(' '),
        })

        decorations.push(decoration)
      }

      from = to
    })
  })

  return DecorationSet.create(doc, decorations)
}

function hasNodeBetween(doc: ProsemirrorNode, from: number, to: number, name: string) {
  let found = false

  doc.nodesBetween(from, to, node => {
    if (found) {
      return false
    }

    if (node.type.name === name) {
      found = true
      return false
    }

    return !node.isTextblock
  })

  return found
}

/**
 * Checks whether a transaction changed a node with the given name,
 * or content around it, in the document before or after the transaction.
 */
function changesNode(transaction: Transaction, name: string) {
  return getChangedRanges(transaction).some(
    ({ oldRange, newRange }) =>
      hasNodeBetween(transaction.before, oldRange.from, oldRange.to, name) ||
      hasNodeBetween(transaction.doc, newRange.from, newRange.to, name),
  )
}

// oxlint-disable-next-lineno-unsafe-function-type
function isFunction(param: any): param is Function {
  return typeof param === 'function'
}

export function LowlightPlugin({
  name,
  lowlight,
  defaultLanguage,
}: {
  name: string
  lowlight: any
  defaultLanguage: string | null | undefined
}) {
  if (!['highlight', 'highlightAuto', 'listLanguages'].every(api => isFunction(lowlight[api]))) {
    throw Error(
      'You should provide an instance of lowlight to use the code-block-lowlight extension',
    )
  }

  const lowlightPlugin: Plugin<any> = new Plugin({
    key: new PluginKey('lowlight'),

    state: {
      init: (_, { doc }) =>
        getDecorations({
          doc,
          name,
          lowlight,
          defaultLanguage,
        }),
      apply: (transaction, decorationSet, oldState, newState) => {
        if (!transaction.docChanged) {
          return decorationSet
        }

        const oldNodeName = oldState.selection.$head.parent.type.name
        const newNodeName = newState.selection.$head.parent.type.name

        if (
          (transaction.docChanged &&
            // Apply decorations if:
            // selection includes named node,
            [oldNodeName, newNodeName].includes(name)) ||
          // OR transaction adds, removes or changes a named node.
          // This also covers changes to the entire document, for example
          // during collab synching via y-prosemirror.
          changesNode(transaction, name)
        ) {
          return getDecorations({
            doc: transaction.doc,
            name,
            lowlight,
            defaultLanguage,
          })
        }

        return decorationSet.map(transaction.mapping, transaction.doc)
      },
    },

    props: {
      decorations(state) {
        return lowlightPlugin.getState(state)
      },
    },
  })

  return lowlightPlugin
}
