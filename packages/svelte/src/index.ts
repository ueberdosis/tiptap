import TiptapRoot from './components/Tiptap.svelte'
import TiptapContent from './components/TiptapContent.svelte'

export { default as EditorContent } from './components/EditorContent.svelte'
export { getEditor } from './components/editorContext.js'
export { default as NodeViewContent } from './components/NodeViewContent.svelte'
export { default as NodeViewWrapper } from './components/NodeViewWrapper.svelte'
export { Editor } from './Editor.js'
export { useEditor } from './hooks/useEditor.svelte.js'
export { useEditorState } from './hooks/useEditorState.svelte.js'
export { SvelteMarkViewRenderer } from './renderers/SvelteMarkViewRenderer.js'
export { SvelteNodeViewRenderer } from './renderers/SvelteNodeViewRenderer.js'
export { SvelteRenderer } from './renderers/SvelteRenderer.js'

export const Tiptap = Object.assign(TiptapRoot, { Content: TiptapContent })

export * from '@tiptap/core'
