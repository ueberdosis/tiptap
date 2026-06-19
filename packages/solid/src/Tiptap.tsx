import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'

import { EditorContext } from './editorContext.js'
import { EditorContent } from './EditorContent.js'
import type { Editor } from './Editor.js'
import { getEditor } from './editorContext.js'

export type TiptapProps = {
  editor: Editor
  children?: JSX.Element
}

export function TiptapProvider(props: TiptapProps) {
  const [local] = splitProps(props, ['editor', 'children'])

  if (!local.editor) {
    throw new Error('Tiptap: An editor instance is required. Pass a non-null `editor` prop.')
  }

  return <EditorContext.Provider value={local.editor}>{local.children}</EditorContext.Provider>
}

export function TiptapContent(props: Omit<EditorContentProps, 'editor'>) {
  const editor = getEditor()

  return <EditorContent editor={editor} {...props} />
}

type EditorContentProps = JSX.HTMLAttributes<HTMLDivElement>

export const Tiptap = Object.assign(TiptapProvider, {
  Content: TiptapContent,
})
