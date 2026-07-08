export { collectReactMarkViews, collectReactNodeViews } from './collectExtensionViews.js'
export type { ReactNodeViewRendererOptions } from './ReactNodeViewRenderer.js'
export { nodeView, reactNodeViewComponent, ReactNodeViewRenderer } from './ReactNodeViewRenderer.js'
export type {
  MarkViewContentProps,
  MarkViewContextProps,
  ReactMarkViewRendererOptions,
} from './ReactMarkViewRenderer.js'
export {
  markView,
  MarkViewContent,
  ReactMarkViewContext,
  reactMarkViewComponent,
  ReactMarkViewRenderer,
} from './ReactMarkViewRenderer.js'
export type { CurrentEditorContextValue } from './Context.js'
export { useCurrentEditor } from './Context.js'
export type {
  TiptapContextType,
  TiptapWrapperEditorInstanceProps,
  TiptapWrapperProps,
} from './Tiptap.js'
export {
  Tiptap,
  TiptapContent,
  TiptapContext,
  TiptapWrapper,
  useTiptap,
  useTiptapState,
} from './Tiptap.js'
export type { NodeViewContentProps } from './NodeViewContent.js'
export { NodeViewContent } from './NodeViewContent.js'
export type { NodeViewWrapperProps } from './NodeViewWrapper.js'
export { NodeViewWrapper } from './NodeViewWrapper.js'
export type { ReactNodeViewProps } from './types.js'
export type { ReactNodeViewContextProps } from './useReactNodeView.js'
export {
  ReactNodeViewContentProvider,
  ReactNodeViewContext,
  useReactNodeView,
} from './useReactNodeView.js'
export { reorderSiblings } from './commands/reorderSiblings.js'
export type { DecoratedTextProps } from './components/DecoratedText.js'
export { DecoratedText } from './components/DecoratedText.js'
export type { DocViewProps } from './components/DocView.js'
export { DocView } from './components/DocView.js'
export type { EditorContentProps } from './components/EditorContent.js'
export { EditorContent } from './components/EditorContent.js'
// Renamed exports: `@tiptap/core` owns MarkView/NodeView (and their props
// types) on a drop-in package — see the star re-export at the bottom
export type { MarkViewProps as RendererMarkViewProps } from './components/MarkView.js'
export { MarkView as RendererMarkView } from './components/MarkView.js'
export type {
  MarkViewComponent,
  MarkViewComponentProps,
} from './components/MarkViewComponentProps.js'
export type {
  NodeViewComponent,
  NodeViewComponentProps,
} from './components/NodeViewComponentProps.js'
export type { ReactMarkViewProps } from './components/ReactMarkView.js'
export { ReactMarkView } from './components/ReactMarkView.js'
export type { ReactNodeViewHostProps } from './components/ReactNodeView.js'
export { ReactNodeView } from './components/ReactNodeView.js'
export { ReactRendererExtension } from './extension.js'
export { createRendererEditor } from './createRendererEditor.js'
export type { ReactRendererOptions } from './ReactRenderer.js'
export { ReactRenderer } from './ReactRenderer.js'
export type { UseEditorOptions } from './useEditor.js'
export { useEditor } from './useEditor.js'
export type { EditorStateSnapshot, UseEditorStateOptions } from './useEditorState.js'
export { useEditorState } from './useEditorState.js'
export type {
  ChildNodeViewsProps,
  NodeViewProps as RendererNodeViewProps,
} from './components/NodeView.js'
export { ChildNodeViews, NodeView as RendererNodeView } from './components/NodeView.js'
export type { OutputSpecOptions } from './components/OutputSpecView.js'
export { renderOutputSpec } from './components/OutputSpecView.js'
export type { WidgetViewProps } from './components/WidgetView.js'
export { WidgetView } from './components/WidgetView.js'
export { EMPTY_SCHEMA, EMPTY_STATE } from './constants.js'
export type { NodeCallback, WidgetCallback } from './decorations/iterDeco.js'
export { iterDeco } from './decorations/iterDeco.js'
export type { TextDecoLevel } from './decorations/outerDeco.js'
export { computeTextDecoLevels, mergeElementDecoAttrs } from './decorations/outerDeco.js'
export { DecorationSourceGroup, viewDecorations } from './decorations/viewDecorations.js'
export type {
  ReactWidgetSpec,
  WidgetComponent,
  WidgetComponentProps,
} from './decorations/widget.js'
export { widget } from './decorations/widget.js'
export type { EditorContextValue } from './contexts/EditorContext.js'
export { EditorContext, useEditorContext } from './contexts/EditorContext.js'
export type { NodeViewContextValue, NodeViewHandlers } from './contexts/NodeViewContext.js'
export { NodeViewContext, useNodeViewContext } from './contexts/NodeViewContext.js'
export { ReactKeysContext, useReactKeys } from './contexts/ReactKeysContext.js'
export { useEditorEffect } from './hooks/useEditorEffect.js'
export { useEditorEventCallback } from './hooks/useEditorEventCallback.js'
export { useEditorEventListener } from './hooks/useEditorEventListener.js'
export {
  useIgnoreMutation,
  useIsNodeSelected,
  useNodePos,
  useStopEvent,
} from './hooks/useNodeViewHooks.js'
export { beforeInput } from './plugins/beforeInput.js'
export type { ReactKeysPluginMeta, ReactKeysPluginState } from './plugins/reactKeys.js'
export { createNodeKey, reactKeys, reactKeysPluginKey } from './plugins/reactKeys.js'
export { detachNodeViewDesc, rebuildChildDescs, updateNodeViewDesc } from './descriptors.js'
export type { UseNodeViewDescOptions } from './hooks/useNodeViewDesc.js'
export { useNodeViewDesc } from './hooks/useNodeViewDesc.js'
export { attributesToProps } from './props.js'
export { mergeRefs, useMergedRefs } from './refs.js'
export type { DocViewLike, ReactEditorViewPlace } from './ReactEditorView.js'
export { ReactEditorView } from './ReactEditorView.js'
export {
  CHILD_DIRTY,
  CONTENT_DIRTY,
  domIndex,
  NODE_DIRTY,
  MarkViewDesc,
  NodeViewDesc,
  NOT_DIRTY,
  TextViewDesc,
  TrailingHackViewDesc,
  ViewDesc,
  WidgetViewDesc,
} from './viewdesc.js'

// Drop-in surface: everything from @tiptap/core, exactly like
// @tiptap/react. Explicit local exports above shadow same-named core
// exports, so collisions are renamed (Renderer*) to let core win.
export * from '@tiptap/core'
