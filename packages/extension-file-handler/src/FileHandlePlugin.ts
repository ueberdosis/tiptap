import { Plugin, PluginKey } from '@tiptap/pm/state'

import { FileHandlePluginOptions } from './types.js'

export const FileHandlePlugin = ({
  key, editor, onPaste, onDrop, allowedMimeTypes,
}: FileHandlePluginOptions) => {
  return new Plugin({
    key: key || new PluginKey('fileHandler'),

    props: {
      handleDrop(_view, event) {
        if (!onDrop) {
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

        // if there is also file data inside the clipboard html,
        // we won't use the files array and instead get the file url from the html
        // this mostly happens for gifs or webms as they are not copied correctly as a file
        // and will always be transformed into a PNG
        // in this case we will let other extensions handle the incoming html via their inputRules
        if (htmlContent.length > 0) {
          return false
        }

        return true
      },
    },
  })
}
