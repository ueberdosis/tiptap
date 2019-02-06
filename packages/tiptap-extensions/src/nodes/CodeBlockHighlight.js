import { Node, Plugin } from 'tiptap'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { toggleBlockType, setBlockType, textblockTypeInputRule } from 'tiptap-commands'
import { findBlockNodes } from 'prosemirror-utils'
import low from 'lowlight/lib/core'

function getDecorations(doc) {
  const decorations = []

  const blocks = findBlockNodes(doc)
    .filter(item => item.node.type.name === 'code_block')

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

export default class CodeBlockHighlight extends Node {

  constructor(options = {}) {
    super(options)
    try {
      Object.entries(this.options.languages).forEach(([name, mapping]) => {
        low.registerLanguage(name, mapping)
      })
    } catch (err) {
      throw new Error('Invalid syntax highlight definitions: define at least one highlight.js language mapping')
    }
  }

  get defaultOptions() {
    return {
      languages: {},
    }
  }

  get name() {
    return 'code_block'
  }

  get schema() {
    return {
      content: 'text*',
      marks: '',
      group: 'block',
      code: true,
      defining: true,
      draggable: false,
      parseDOM: [
        { tag: 'pre', preserveWhitespace: 'full' },
      ],
      toDOM: () => ['pre', ['code', 0]],
    }
  }

  commands({ type, schema }) {
    return () => toggleBlockType(type, schema.nodes.paragraph)
  }

  keys({ type }) {
    return {
      'Shift-Ctrl-\\': setBlockType(type),
    }
  }

  inputRules({ type }) {
    return [
      textblockTypeInputRule(/^```$/, type),
    ]
  }

  get plugins() {
    return [
      new Plugin({
        state: {
          init(_, { doc }) {
            return getDecorations(doc)
          },
          apply(transaction, decorationSet, oldState, state) {
            // TODO: find way to cache decorations
            // see: https://discuss.prosemirror.net/t/how-to-update-multiple-inline-decorations-on-node-change/1493

            const nodeName = state.selection.$head.parent.type.name
            const previousNodeName = oldState.selection.$head.parent.type.name

            if (transaction.docChanged && [nodeName, previousNodeName].includes('code_block')) {
              return getDecorations(transaction.doc)
            }

            return decorationSet.map(transaction.mapping, transaction.doc)
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  }

}
