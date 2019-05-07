import { Node, Plugin } from 'tiptap'
import { Decoration, DecorationSet } from 'prosemirror-view'

const NODE_NAME = 'title'
const BreakException = {}

export default class Title extends Node {
  get name() {
    return NODE_NAME
  }

  get defaultOptions() {
    return {
      emptyClass: 'is-empty',
      titlePlaceholder: 'Write a title',
      paragraphPlaceholder: 'Great thoughts starts here...',
      headingClass: 'article-title',
    }
  }

  get update() {
    return view => {
      view.updateState(view.state)
    }
  }

  get schema() {
    const { headingClass } = this.options
    return {
      content: 'inline*',
      group: 'block',
      parseDOM: [
        {
          tag: `h1.${headingClass}`,
        },
      ],
      toDOM: () => ['h1', { class: 'article-title' }, 0],
    }
  }

  get plugins() {
    return [
      new Plugin({
        appendTransaction: (transactions, oldState, newState) => {
          const {
            schema: { nodes },
            doc: {
              childCount: docChildCount,
              content: { content: docContent },
              firstChild: {
                nodeSize: titleSize,
                type: { name: titleNodeName },
              },
            },
          } = newState
          if (titleNodeName !== NODE_NAME) {
            return newState.tr
              .replaceWith(0, 0, nodes.title.create())
              .setMeta({})
          }

          const secondChild = newState.doc.maybeChild(1)
          if (docChildCount === 1 && !secondChild) {
            return newState.tr
              .replaceWith(titleSize, titleSize, nodes.paragraph.create())
              .setMeta({})
          }

          let startFrom = 0
          let transaction = false
          try {
            docContent.forEach((item, start) => {
              const {
                nodeSize,
                content: { content },
                type: { name: nodeName },
              } = item

              if (start > 0 && nodeName === NODE_NAME) {
                transaction = newState.tr
                  .replaceWith(
                    startFrom,
                    startFrom + nodeSize,
                    nodes.paragraph.create(),
                  )
                  .insertText(content[0].text)
              }

              if (transaction) {
                throw BreakException
              }

              startFrom += nodeSize
            })
          } catch (err) {
            if (err !== BreakException) {
              throw err
            }
          }

          return transaction
        },
        props: {
          decorations: ({ doc, plugins }) => {
            const decorations = []

            if (
              !plugins
                .find(plugin => plugin.key.startsWith('editable$'))
                .props.editable()
            ) {
              return false
            }

            const {
              firstChild: {
                textContent: titleContent,
                childCount: titleChildCount,
                nodeSize: titleSize,
                type: { name: titleNodeName },
              },
            } = doc

            const secondNode = doc.maybeChild(1)

            const {
              emptyClass,
              titlePlaceholder,
              paragraphPlaceholder,
            } = this.options

            if (
              !titleContent
              && !titleChildCount
              && titleNodeName === NODE_NAME
            ) {
              decorations.push(
                Decoration.node(0, titleSize, {
                  class: emptyClass,
                  'data-placeholder': titlePlaceholder,
                }),
              )
            }

            if (
              secondNode
              && !secondNode.textContent
              && !secondNode.content.childCount
              && secondNode.type.name === 'paragraph'
              && doc.content.childCount <= 2
            ) {
              decorations.push(
                Decoration.node(titleSize, titleSize + secondNode.nodeSize, {
                  class: emptyClass,
                  'data-placeholder': paragraphPlaceholder,
                }),
              )
            }

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  }
}
