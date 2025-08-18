import type { Editor } from '@tiptap/core'

export function getEditor(target: HTMLElement | null): Editor | null {
  if (!target) {
    return null
  }

  let currentElement: HTMLElement | null = target as HTMLElement

  while (currentElement) {
    if (currentElement.classList.contains('tiptap') && currentElement.classList.contains('ProseMirror')) {
      return (currentElement as unknown as { editor?: Editor }).editor ?? null
    }

    currentElement = currentElement.parentElement
  }

  return null
}
