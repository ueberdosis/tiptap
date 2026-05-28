import type { JSONContent } from '../../types.js'

export type {
  AddMarkAttributeOp,
  AddMarkOp,
  OpCondition,
  MigrationOperation,
  RemoveAttrOp,
  RemoveMarkAttributeOp,
  RemoveMarkOp,
  RemoveNodeOp,
  RenameAttrOp,
  RenameMarkAttributeOp,
  RenameMarkOp,
  RenameNodeOp,
  SetAttrOp,
  UnwrapNodeOp,
  WrapNodeOp,
} from '../../types.js'

export type ApplyOpResult = JSONContent | JSONContent[] | null
