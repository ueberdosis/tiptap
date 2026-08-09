import { Plugin, PluginKey } from '@tiptap/pm/state'

import type { FileHandlePluginOptions } from './types.js'

export const FileHandlePlugin = ({
  key,
  editor,
  onPaste,
  onDrop,
  allowedMimeTypes,
  consumePasteEvent,
}: FileHandlePluginOptions) => {
  return new Plugin({
    key: key || new PluginKey('fileHandler'),

    props: {
      handleDrop(_view, event) {
        if (!onDrop) {
          return false
        }

        // If the drop contains ProseMirror internal slice data, let ProseMirror
        // handle it — this is an internal content drag (e.g. moving an image),
        // not an external file drop
        if (event.dataTransfer?.types.includes('application/x-prosemirror-slice')) {
          return false
        }

        if (!event.dataTransfer?.files.length) {
          return false
        }

        const dropPos = _view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        })

        let filesArray = Array.from(event.dataTransfer.files)

        if (allowedMimeTypes) {
          filesArray = filesArray.filter(file => allowedMimeTypes.includes(file.type))
        }

        if (filesArray.length === 0) {
          return false
        }

        event.preventDefault()
        event.stopPropagation()

        onDrop(editor, filesArray, dropPos?.pos || 0)

        return true
      },

      handlePaste(_view, event) {
        if (!onPaste) {
          return false
        }

        if (!event.clipboardData?.files.length) {
          return false
        }

        let filesArray = Array.from(event.clipboardData.files)
        const htmlContent = event.clipboardData.getData('text/html')

        if (allowedMimeTypes) {
          filesArray = filesArray.filter(file => allowedMimeTypes.includes(file.type))
        }

        if (filesArray.length === 0) {
          return false
        }

        event.preventDefault()
        event.stopPropagation()

        onPaste(editor, filesArray, htmlContent)

        // When HTML content is present alongside files (e.g. animated GIFs
        // copied as PNG), and consumePasteEvent is not set, let other
        // extensions handle the HTML content via their parseHTML/paste rules.
        if (htmlContent.length > 0 && !consumePasteEvent) {
          return false
        }

        return true
      },
    },
  })
}
