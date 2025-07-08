import type { Node as ProseMirrorNode, ParseOptions } from '@tiptap/pm/model'
import { Fragment } from '@tiptap/pm/model'

import { createNodeFromContent } from '../helpers/createNodeFromContent.js'
import { selectionToInsertionEnd } from '../helpers/selectionToInsertionEnd.js'
import type { Content, Range, RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insertContentAt: {
      /**
       * Insert a node or string of HTML at a specific position.
       * @example editor.commands.insertContentAt(0, '<h1>Example</h1>')
       */
      insertContentAt: (
        /**
         * The position to insert the content at.
         */
        position: number | Range,

        /**
         * The ProseMirror content to insert.
         */
        value: Content | ProseMirrorNode | Fragment,

        /**
         * Optional options
         */
        options?: {
          /**
           * Options for parsing the content.
           */
          parseOptions?: ParseOptions

          /**
           * Whether to update the selection after inserting the content.
           */
          updateSelection?: boolean

          /**
           * Whether to apply input rules after inserting the content.
           */
          applyInputRules?: boolean

          /**
           * Whether to apply paste rules after inserting the content.
           */
          applyPasteRules?: boolean

          /**
           * Whether to throw an error if the content is invalid.
           */
          errorOnInvalidContent?: boolean
        },
      ) => ReturnType
    }
  }
}

const isFragment = (nodeOrFragment: ProseMirrorNode | Fragment): nodeOrFragment is Fragment => {
  return !('type' in nodeOrFragment)
}

export const insertContentAt: RawCommands['insertContentAt'] =
  (position, value, options) =>
  ({ tr, dispatch, editor }) => {
    if (dispatch) {
      options = {
        parseOptions: editor.options.parseOptions,
        updateSelection: true,
        applyInputRules: false,
        applyPasteRules: false,
        ...options,
      }

      let content: Fragment | ProseMirrorNode
      const { selection } = editor.state

      const emitContentError = (error: Error) => {
        editor.emit('contentError', {
          editor,
          error,
          disableCollaboration: () => {
            if (
              'collaboration' in editor.storage &&
              typeof editor.storage.collaboration === 'object' &&
              editor.storage.collaboration
            ) {
              ;(editor.storage.collaboration as any).isDisabled = true
            }
          },
        })
      }

      const parseOptions: ParseOptions = {
        preserveWhitespace: 'full',
        ...options.parseOptions,
      }

      // If `emitContentError` is enabled, we want to check the content for errors
      // but ignore them (do not remove the invalid content from the document)
      if (!options.errorOnInvalidContent && !editor.options.enableContentCheck && editor.options.emitContentError) {
        try {
          createNodeFromContent(value, editor.schema, {
            parseOptions,
            errorOnInvalidContent: true,
          })
        } catch (e) {
          emitContentError(e as Error)
        }
      }

      try {
        content = createNodeFromContent(value, editor.schema, {
          parseOptions,
          errorOnInvalidContent: options.errorOnInvalidContent ?? editor.options.enableContentCheck,
        })
      } catch (e) {
        emitContentError(e as Error)
        return false
      }

      let { from, to } =
        typeof position === 'number' ? { from: position, to: position } : { from: position.from, to: position.to }

      let isOnlyTextContent = true
      let isOnlyBlockContent = true
      const nodes = isFragment(content) ? content : [content]

      nodes.forEach(node => {
        // check if added node is valid
        node.check()

        isOnlyTextContent = isOnlyTextContent ? node.isText && node.marks.length === 0 : false

        isOnlyBlockContent = isOnlyBlockContent ? node.isBlock : false
      })

      // check if we can replace the wrapping node by
      // the newly inserted content
      // example:
      // replace an empty paragraph by an inserted image
      // instead of inserting the image below the paragraph
      if (from === to && isOnlyBlockContent) {
        const { parent } = tr.doc.resolve(from)
        const isEmptyTextBlock = parent.isTextblock && !parent.type.spec.code && !parent.childCount

        if (isEmptyTextBlock) {
          from -= 1
          to += 1
        }
      }

      let newContent

      // if there is only plain text we have to use `insertText`
      // because this will keep the current marks
      if (isOnlyTextContent) {
        // if value is string, we can use it directly
        // otherwise if it is an array, we have to join it
        if (Array.isArray(value)) {
          newContent = value.map(v => v.text || '').join('')
        } else if (value instanceof Fragment) {
          let text = ''

          value.forEach(node => {
            if (node.text) {
              text += node.text
            }
          })

          newContent = text
        } else if (typeof value === 'object' && !!value && !!value.text) {
          newContent = value.text
        } else {
          newContent = value as string
        }

        tr.insertText(newContent, from, to)
      } else {
        newContent = content

        const fromSelectionAtStart = selection.$from.parentOffset === 0
        const isTextSelection = selection.$from.node().isText || selection.$from.node().isTextblock
        const hasContent = selection.$from.node().content.size > 0

        if (fromSelectionAtStart && isTextSelection && hasContent) {
          from = Math.max(0, from - 1)
        }

        tr.replaceWith(from, to, newContent)
      }

      // set cursor at end of inserted content
      if (options.updateSelection) {
        selectionToInsertionEnd(tr, tr.steps.length - 1, -1)
      }

      if (options.applyInputRules) {
        tr.setMeta('applyInputRules', { from, text: newContent })
      }

      if (options.applyPasteRules) {
        tr.setMeta('applyPasteRules', { from, text: newContent })
      }
    }

    return true
  }
