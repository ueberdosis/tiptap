import type { Node as ProseMirrorNode, NodeType } from '@tiptap/pm/model'

export interface ListConversionContext {
  listType: NodeType
  itemType: NodeType
  isListNode: (node: ProseMirrorNode) => boolean
}

export interface ListItemConversionState {
  items: ProseMirrorNode[]
  pendingContent: ProseMirrorNode[]
}

export type ConvertListItems = (
  sourceList: ProseMirrorNode,
  context: ListConversionContext,
) => ProseMirrorNode[] | null
