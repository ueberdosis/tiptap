import type { Editor } from '@tiptap/core'
import type { Owner } from 'solid-js'

import type { Editor as SolidEditor } from './Editor.js'

export const ReactiveOwnerProperty = Symbol.for('tiptap.solid.reactiveOwner')

export function setReactiveOwner(editor: Editor, owner: Owner | null): void {
  ;(editor as Editor & { [ReactiveOwnerProperty]?: Owner | null })[ReactiveOwnerProperty] = owner
}

export function getReactiveOwner(editor: Editor): Owner | undefined {
  return (
    (editor as Editor & { [ReactiveOwnerProperty]?: Owner | null })[ReactiveOwnerProperty] ??
    undefined
  )
}

/**
 * Prefer the owner from <EditorContent>, so node and mark views
 * inherit context from components wrapping the editor content.
 */
export function getRenderOwner(editor: Editor): Owner | undefined {
  const contentOwner = (editor as SolidEditor).contentComponent?.owner

  if (contentOwner) {
    return contentOwner as Owner
  }

  return getReactiveOwner(editor)
}
