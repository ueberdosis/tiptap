import { type Editor, Extension } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'

import { FileHandlePlugin } from './FileHandlePlugin.js'
import type { CloudFileHandlerOptions } from './types.js'

type TUploadUrlErrorResponse = {
  error: string
}

type TUploadUrlResponse = {
  filename: string
  uploadUrl: string
  uploadUrlExpiresIn: number
  viewUrl: string
}

export const CloudFileHandler = Extension.create<CloudFileHandlerOptions>({
  name: 'cloudFileHandler',

  addOptions() {
    return {
      appId: '', // this is your collab server app id (required trial / paid plan). Get it here: https://cloud.tiptap.dev/v2/configuration/document-server
      allowedMimeTypes: undefined,
    }
  },

  addProseMirrorPlugins() {
    const handleUpload = async (file: File) => {
      const result = await fetch(`https://${this.options.appId}.collab.tiptap.cloud/publicapi/filehandler/uploadUrl`, {
        method: 'post',
        body: JSON.stringify({
          contentLength: file.size,
          contentType: file.type,
        }),
        headers: {
          'content-type': 'application/json',
        },
      })

      const body = await result.json()

      if (!result.ok || body.error) {
        throw new Error(`Failed to get upload url: ${(body as unknown as TUploadUrlErrorResponse).error}`)
      }

      const successBody = body as unknown as TUploadUrlResponse

      const formData = new FormData()
      formData.append('file', file)
      formData.append('Content-Type', file.type)
      formData.append('Content-Length', String(file.size))

      const uploadResult = await fetch(successBody.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      })

      if (uploadResult.ok) {
        return successBody.viewUrl
      }

      throw new Error(`Failed to upload file: ${await uploadResult.text()})`)
    }

    const insertImage = (editor: Editor, pos: number, url: string) => {
      editor
        .chain()
        .insertContentAt(pos, {
          type: 'image',
          attrs: {
            src: url,
          },
        })
        .focus()
        .run()
    }

    const handleFiles = (editor: Editor, files: File[], pos: number) => {
      files.forEach(file => {
        handleUpload(file).then(publicViewUrl => {
          if (publicViewUrl) {
            insertImage(editor, pos, publicViewUrl)
          }
        })
      })
    }

    return [
      FileHandlePlugin({
        key: new PluginKey(this.name),
        editor: this.editor,
        allowedMimeTypes: this.options.allowedMimeTypes,
        onDrop: async (editor, files, pos) => {
          handleFiles(editor, files, pos)
        },
        onPaste: async (editor, files, htmlContent) => {
          if (htmlContent) {
            return false
          }

          handleFiles(editor, files, editor.state.selection.anchor)
        },
      }),
    ]
  },
})
