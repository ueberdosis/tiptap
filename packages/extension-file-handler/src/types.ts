import { Editor } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'

export type FileHandlePluginOptions = {
  /**
   * The plugin key.
   * @default 'fileHandler'
   */
  key?: PluginKey

  /**
   * The editor instance.
   */
  editor: Editor

  /**
   * An array of allowed mimetypes
   *
   * example: ['image/jpeg', 'image/png']
   */
  allowedMimeTypes?: string[]

  /**
   * The onPaste callback that is called when a file is pasted.
   * @param editor the editor instance
   * @param files the File array including File objects
   * @param pasteContent the pasted content as HTML string - this is only available if there is also html copied to the clipboard for example by copying from a website
   * @returns Returns nothing.
   */
  onPaste?: (editor: Editor, files: File[], pasteContent?: string) => void

  /**
   * The onDrop callback that is called when a file is dropped.
   * @param editor the editor instance
   * @param files the File array including File objects
   * @returns Returns nothing.
   */
  onDrop?: (editor: Editor, files: File[], pos: number) => void
}

export type FileHandlerOptions = {} & Omit<FileHandlePluginOptions, 'key' | 'editor'>
