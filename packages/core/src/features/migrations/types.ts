import type { JSONContent } from '../../types.js'

export type {
  AddMarkAttributeOp,
  AddMarkOp,
  MarkCondition,
  MigrationOperation,
  RemoveAttrOp,
  RemoveMarkAttributeOp,
  RemoveMarkOp,
  RenameAttrOp,
  RenameMarkAttributeOp,
  RenameMarkOp,
  RenameNodeOp,
  SetAttrOp,
  UnwrapNodeOp,
  WrapNodeOp,
} from '../../types.js'

export type ApplyOpResult = JSONContent | JSONContent[] | null
