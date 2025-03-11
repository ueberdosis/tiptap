import type { Editor } from '@tiptap/core'
import type { Owner } from 'solid-js'

export const ReactiveOwnerProperty = Symbol('@tiptap/solid/reactive-owner')

export const getTiptapSolidReactiveOwner = (editor: Editor): Owner | undefined =>
  (editor as any)[ReactiveOwnerProperty] ?? undefined

export const setTiptapSolidReactiveOwner = (editor: Editor, owner: Owner | null) => {
  ;(editor as any)[ReactiveOwnerProperty] = owner
}
