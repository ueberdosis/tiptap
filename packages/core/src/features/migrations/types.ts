import type { JSONContent } from '../../types.js'

export type RenameNodeOp = {
  type: 'renameNode'
  from: string
  to: string
}

export type RenameAttrOp = {
  type: 'renameAttr'
  nodeType: string
  from: string
  to: string
}

export type SetAttrOp = {
  type: 'setAttr'
  nodeType: string
  key: string
  value: unknown
}

export type RemoveAttrOp = {
  type: 'removeAttr'
  nodeType: string
  key: string
}

export type UnwrapNodeOp = {
  type: 'unwrapNode'
  nodeType: string
}

export type WrapNodeOp = {
  type: 'wrapNode'
  nodeType: string
  wrapper: JSONContent
}

export type MigrationOperation =
  | RenameNodeOp
  | RenameAttrOp
  | SetAttrOp
  | RemoveAttrOp
  | UnwrapNodeOp
  | WrapNodeOp

export type ApplyOpResult = JSONContent | JSONContent[] | null
