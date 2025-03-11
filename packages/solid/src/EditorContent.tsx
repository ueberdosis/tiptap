import { mergeRefs } from '@solid-primitives/refs'
import type { Editor } from '@tiptap/core'
import { type JSX, type Ref, createEffect, on, onCleanup, Show, splitProps } from 'solid-js'

export interface PureEditorContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>
  editor: Editor | undefined
}

export function PureEditorContent(props: PureEditorContentProps) {
  let editorContainer!: HTMLDivElement

  const [, rest] = splitProps(props, ['ref', 'editor'])

  createEffect(
    on(
      () => props.editor,
      editor => {
        if (editor && !editor.isDestroyed && editor.options.element) {
          const element = editorContainer

          element.append(...editor.options.element.childNodes)

          editor.setOptions({
            element,
          })

          editor.createNodeViews()
        }
      },
    ),
  )

  onCleanup(() => {
    const editor = props.editor
    if (!editor) {
      return
    }

    if (!editor.isDestroyed) {
      editor.view.setProps({
        nodeViews: {},
      })
    }

    if (!editor.options.element?.firstChild) {
      return
    }

    // TODO using the new editor.mount method might allow us to remove this
    const newElement = document.createElement('div')

    newElement.append(...editor.options.element.childNodes)

    editor.setOptions({
      element: newElement,
    })
  })

  return <div ref={mergeRefs(props.ref, e => (editorContainer = e))} {...rest} />
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EditorContentProps extends PureEditorContentProps {}

// EditorContent should be re-created whenever the Editor instance changes
export const EditorContent = (props: EditorContentProps) => {
  return (
    <Show when={props.editor} keyed>
      <PureEditorContent {...props} />
    </Show>
  )
}
