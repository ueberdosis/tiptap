import type { JSX } from 'solid-js'
import type { Owner } from 'solid-js'
import { getOwner, onCleanup, onMount, splitProps } from 'solid-js'

import type { Editor } from './Editor.js'
import { setReactiveOwner } from './ReactiveOwner.js'

export type EditorContentProps = JSX.HTMLAttributes<HTMLDivElement> & {
  editor: Editor | null | undefined
}

const isEditorDestroyed = (editor: Editor) => {
  try {
    return editor.view.isDestroyed
  } catch {
    return false
  }
}

export function EditorContent(props: EditorContentProps) {
  const [local, rest] = splitProps(props, ['editor'])
  let rootEl: HTMLDivElement | undefined

  const init = (owner: Owner | null) => {
    const editor = local.editor

    if (!editor || !rootEl || isEditorDestroyed(editor) || editor.contentComponent) {
      return
    }

    if (!editor.view.dom?.parentNode) {
      return
    }

    rootEl.append(...editor.view.dom.parentNode.childNodes)

    editor.setOptions({
      element: rootEl,
    })

    editor.contentComponent = {
      owner,
    }

    setReactiveOwner(editor, owner)
    editor.createNodeViews()
    editor.isEditorContentInitialized = true
  }

  onMount(() => {
    const owner = getOwner() ?? null

    queueMicrotask(() => {
      init(owner)
    })
  })

  onCleanup(() => {
    const editor = local.editor

    if (!editor) {
      return
    }

    editor.isEditorContentInitialized = false
    editor.contentComponent = null
  })

  return (
    <div
      ref={el => {
        rootEl = el ?? undefined
      }}
      {...rest}
    />
  )
}
