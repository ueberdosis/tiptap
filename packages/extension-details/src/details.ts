import {
  createBlockMarkdownSpec,
  defaultBlockAt,
  findChildren,
  findParentNode,
  isActive,
  mergeAttributes,
  Node,
} from '@dibdab/core'
import { Plugin, PluginKey, Selection, TextSelection } from '@dibdab/pm/state'
import type { ViewMutationRecord } from '@dibdab/pm/view'

import { findClosestVisibleNode } from './helpers/findClosestVisibleNode.js'
import { isNodeVisible } from './helpers/isNodeVisible.js'
import { setGapCursor } from './helpers/setGapCursor.js'

export interface DetailsOptions {
  /**
   * Specify if the open status should be saved in the document. Defaults to `false`.
   */
  persist: boolean
  /**
   * Specifies a CSS class that is set when toggling the content. Defaults to `is-open`.
   */
  openClassName: string
  /**
   * Custom HTML attributes that should be added to the rendered HTML tag.
   */
  HTMLAttributes: {
    [key: string]: any
  }
}

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    details: {
      /**
       * Set a details node
       */
      setDetails: () => ReturnType
      /**
       * Unset a details node
       */
      unsetDetails: () => ReturnType
    }
  }
}

export const Details = Node.create<DetailsOptions>({
  name: 'details',

  content: 'detailsSummary detailsContent',

  group: 'block',

  defining: true,

  isolating: true,

  // @ts-ignore reason: `allowGapCursor` is not a valid property by default, but the `GapCursor` extension adds it to the Nodeconfig type
  allowGapCursor: false,

  addOptions() {
    return {
      persist: false,
      openClassName: 'is-open',
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    if (!this.options.persist) {
      return []
    }

    return {
      open: {
        default: false,
        parseHTML: element => element.hasAttribute('open'),
        renderHTML: ({ open }) => {
          if (!open) {
            return {}
          }

          return { open: '' }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'details',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  ...createBlockMarkdownSpec({
    nodeName: 'details',
    content: 'block',
  }),

  addNodeView() {
    return ({ editor, getPos, node, HTMLAttributes }) => {
      const dom = document.createElement('div')
      const attributes = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': this.name,
      })

      Object.entries(attributes).forEach(([key, value]) => dom.setAttribute(key, value))

      const toggle = document.createElement('button')

      toggle.type = 'button'

      dom.append(toggle)

      const content = document.createElement('div')

      dom.append(content)

      const toggleDetailsContent = (setToValue?: boolean) => {
        if (setToValue !== undefined) {
          if (setToValue) {
            if (dom.classList.contains(this.options.openClassName)) {
              return
            }
            dom.classList.add(this.options.openClassName)
          } else {
            if (!dom.classList.contains(this.options.openClassName)) {
              return
            }
            dom.classList.remove(this.options.openClassName)
          }
        } else {
          dom.classList.toggle(this.options.openClassName)
        }

        const event = new Event('toggleDetailsContent')
        const detailsContent = content.querySelector(':scope > div[data-type="detailsContent"]')

        detailsContent?.dispatchEvent(event)
      }

      if (node.attrs.open) {
        setTimeout(() => toggleDetailsContent())
      }

      toggle.addEventListener('click', () => {
        toggleDetailsContent()

        if (!this.options.persist) {
          editor.commands.focus(undefined, { scrollIntoView: false })

          return
        }

        if (editor.isEditable && typeof getPos === 'function') {
          const { from, to } = editor.state.selection

          editor
            .chain()
            .command(({ tr }) => {
              const pos = getPos()

              if (!pos) {
                return false
              }

              const currentNode = tr.doc.nodeAt(pos)

              if (currentNode?.type !== this.type) {
                return false
              }

              tr.setNodeMarkup(pos, undefined, {
                open: !currentNode.attrs.open,
              })

              return true
            })
            .setTextSelection({
              from,
              to,
            })
            .focus(undefined, { scrollIntoView: false })
            .run()
        }
      })

      return {
        dom,
        contentDOM: content,
        ignoreMutation(mutation: ViewMutationRecord) {
          if (mutation.type === 'selection') {
            return false
          }

          return !dom.contains(mutation.target) || dom === mutation.target
        },
        update: updatedNode => {
          if (updatedNode.type !== this.type) {
            return false
          }

          // Only update the open state if set
          if (updatedNode.attrs.open !== undefined) {
            toggleDetailsContent(updatedNode.attrs.open)
          }

          return true
        },
      }
    }
  },

  addCommands() {
    return {
      setDetails:
        () =>
        ({ state, chain }) => {
          const { schema, selection } = state
          const { $from, $to } = selection
          const range = $from.blockRange($to)

          if (!range) {
            return false
          }

          const slice = state.doc.slice(range.start, range.end)
          const match = schema.nodes.detailsContent.contentMatch.matchFragment(slice.content)

          if (!match) {
            return false
          }

          const content = slice.toJSON()?.content || []

          return chain()
            .insertContentAt(
              { from: range.start, to: range.end },
              {
                type: this.name,
                content: [
                  {
                    type: 'detailsSummary',
                  },
                  {
                    type: 'detailsContent',
                    content,
                  },
                ],
              },
            )
            .setTextSelection(range.start + 2)
            .run()
        },

      unsetDetails:
        () =>
        ({ state, chain }) => {
          const { selection, schema } = state
          const details = findParentNode(node => node.type === this.type)(selection)

          if (!details) {
            return false
          }

          const detailsSummaries = findChildren(details.node, node => node.type === schema.nodes.detailsSummary)
          const detailsContents = findChildren(details.node, node => node.type === schema.nodes.detailsContent)

          if (!detailsSummaries.length || !detailsContents.length) {
            return false
          }

          const detailsSummary = detailsSummaries[0]
          const detailsContent = detailsContents[0]
          const from = details.pos
          const $from = state.doc.resolve(from)
          const to = from + details.node.nodeSize
          const range = { from, to }
          const content = (detailsContent.node.content.toJSON() as []) || []
          const defaultTypeForSummary = $from.parent.type.contentMatch.defaultType

          // TODO: this may break for some custom schemas
          const summaryContent = defaultTypeForSummary?.create(null, detailsSummary.node.content).toJSON()
          const mergedContent = [summaryContent, ...content]

          return chain()
            .insertContentAt(range, mergedContent)
            .setTextSelection(from + 1)
            .run()
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { schema, selection } = this.editor.state
        const { empty, $anchor } = selection

        if (!empty || $anchor.parent.type !== schema.nodes.detailsSummary) {
          return false
        }

        // for some reason safari removes the whole text content within a `<summary>`tag on backspace
        // so we have to remove the text manually
        // see: https://discuss.prosemirror.net/t/safari-backspace-bug-with-details-tag/4223
        if ($anchor.parentOffset !== 0) {
          return this.editor.commands.command(({ tr }) => {
            const from = $anchor.pos - 1
            const to = $anchor.pos

            tr.delete(from, to)

            return true
          })
        }

        return this.editor.commands.unsetDetails()
      },

      // Creates a new node below it if it is closed.
      // Otherwise inside `DetailsContent`.
      Enter: ({ editor }) => {
        const { state, view } = editor
        const { schema, selection } = state
        const { $head } = selection

        if ($head.parent.type !== schema.nodes.detailsSummary) {
          return false
        }

        const isVisible = isNodeVisible($head.after() + 1, editor)
        const above = isVisible ? state.doc.nodeAt($head.after()) : $head.node(-2)

        if (!above) {
          return false
        }

        const after = isVisible ? 0 : $head.indexAfter(-1)
        const type = defaultBlockAt(above.contentMatchAt(after))

        if (!type || !above.canReplaceWith(after, after, type)) {
          return false
        }

        const node = type.createAndFill()

        if (!node) {
          return false
        }

        const pos = isVisible ? $head.after() + 1 : $head.after(-1)
        const tr = state.tr.replaceWith(pos, pos, node)
        const $pos = tr.doc.resolve(pos)
        const newSelection = Selection.near($pos, 1)

        tr.setSelection(newSelection)
        tr.scrollIntoView()
        view.dispatch(tr)

        return true
      },

      // The default gapcursor implementation can’t handle hidden content, so we need to fix this.
      ArrowRight: ({ editor }) => {
        return setGapCursor(editor, 'right')
      },

      // The default gapcursor implementation can’t handle hidden content, so we need to fix this.
      ArrowDown: ({ editor }) => {
        return setGapCursor(editor, 'down')
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      // This plugin prevents text selections within the hidden content in `DetailsContent`.
      // The cursor is moved to the next visible position.
      new Plugin({
        key: new PluginKey('detailsSelection'),
        appendTransaction: (transactions, oldState, newState) => {
          const { editor, type } = this
          const isComposing = editor.view.composing

          if (isComposing) {
            return
          }

          const selectionSet = transactions.some(transaction => transaction.selectionSet)

          if (!selectionSet || !oldState.selection.empty || !newState.selection.empty) {
            return
          }

          const detailsIsActive = isActive(newState, type.name)

          if (!detailsIsActive) {
            return
          }

          const { $from } = newState.selection
          const isVisible = isNodeVisible($from.pos, editor)

          if (isVisible) {
            return
          }

          const details = findClosestVisibleNode($from, node => node.type === type, editor)

          if (!details) {
            return
          }

          const detailsSummaries = findChildren(
            details.node,
            node => node.type === newState.schema.nodes.detailsSummary,
          )

          if (!detailsSummaries.length) {
            return
          }

          const detailsSummary = detailsSummaries[0]
          const selectionDirection = oldState.selection.from < newState.selection.from ? 'forward' : 'backward'
          const correctedPosition =
            selectionDirection === 'forward'
              ? details.start + detailsSummary.pos
              : details.pos + detailsSummary.pos + detailsSummary.node.nodeSize
          const selection = TextSelection.create(newState.doc, correctedPosition)
          const transaction = newState.tr.setSelection(selection)

          return transaction
        },
      }),
    ]
  },
})
