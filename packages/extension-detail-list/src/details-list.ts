import { Extension } from '@tiptap/core'

import {
  deleteDetailsItem, exitDetailsContent, insertNewDetailsList, isInsideSummary, moveNodeIntoContent, nodeIsEmpty, NodePosition,
} from './detailsListHelpers/index.js'
import { DetailsListOptions } from './detailsListHelpers/type.js'

export const DetailsList = Extension.create<DetailsListOptions>({
  name: 'detailsList',

  addOptions() {
    return {
      wrapperNodeType: 'details',
      contentNodeType: 'detailsContent',
      summaryNodeType: 'detailsSummary',
    }
  },

  onCreate() {
    if (!this.editor.schema.nodes[this.options.summaryNodeType]) {
      console.warn(`[@tiptap/extension-details-list] You are using the detailsList extension without having a "${this.options.summaryNodeType}" node type.`)
    }

    if (!this.editor.schema.nodes[this.options.contentNodeType]) {
      console.warn(`[@tiptap/extension-details-list] You are using the detailsList extension without having a "${this.options.contentNodeType}" node type.`)
    }
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { editor } = this
        const { state } = editor
        const { $anchor } = state.selection

        const nodePos = new NodePosition($anchor)
        const dom = editor.view.domAtPos(nodePos.from)
        const parent = dom.node.parentNode as HTMLElement
        const isOpen = parent.classList.contains('is-open')

        if (isOpen) {
          const contentPos = nodePos.after

          if (!contentPos) {
            return false
          }

          const slice = state.doc.slice($anchor.pos, nodePos.to - 1)

          return editor.chain()
            .insertContentAt(contentPos.from, slice.content.toJSON())
            .focus(contentPos.from)
            .deleteRange({
              from: $anchor.pos,
              to: nodePos.to,
            })
            .run()
        }

        if (isInsideSummary(this.options.summaryNodeType, state)) {
          return insertNewDetailsList(editor, this.options)
        }

        return false
      },
      Backspace: () => {
        const { editor } = this
        const { state } = editor
        const {
          $anchor, empty,
        } = state.selection

        const nodePos = new NodePosition($anchor)

        const isInContent = nodePos.getParentByType(this.options.contentNodeType)
        const isAfterDetails = nodePos.before?.getParentByType(this.options.wrapperNodeType)?.name === this.options.wrapperNodeType
        const isFirstBlockInDetails = isInContent && nodePos.from - 1 === nodePos.before?.to
        const isAtStart = $anchor.parentOffset === 0 && empty

        if (!empty) {
          return false
        }

        // if the cursor is inside the details content
        // and it's the first block in there
        // move the content from the details content at the end
        // of the summary and delete the details content
        if (isFirstBlockInDetails && isAtStart) {
          const contentSlice = editor.state.doc.slice(nodePos.from + 1, nodePos.to - 1)
          const to = nodePos.before?.to || 0

          return editor
            .chain()
            .insertContentAt(to - 1, contentSlice.content.toJSON())
            .focus(to - 1 || 0)
            .deleteRange({
              from: nodePos.from,
              to: nodePos.to + 1,
            })
            .run()
        }

        if (isInContent && empty) {
          return exitDetailsContent(editor)
        }

        if (isAfterDetails && empty) {
          return moveNodeIntoContent(editor, this.options)
        }

        const isEmpty = nodeIsEmpty(state) && !isAtStart

        if (isInsideSummary(this.options.summaryNodeType, state) && (isEmpty || isAtStart)) {
          return deleteDetailsItem(editor, this.options, false)
        }

        return false
      },
      Delete: () => {
        const { editor } = this
        const { state } = editor

        if (isInsideSummary(this.options.summaryNodeType, state) && nodeIsEmpty(state)) {
          return deleteDetailsItem(editor, this.options, true)
        }

        return false
      },
    }
  },
})
