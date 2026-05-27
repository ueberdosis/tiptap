import type { JSONContent } from '../../types.js'

export type {
  AddMarkOp,
  MigrationOperation,
  RemoveAttrOp,
  RemoveMarkOp,
  RenameAttrOp,
  RenameMarkOp,
  RenameNodeOp,
  SetAttrOp,
  UnwrapNodeOp,
  WrapNodeOp,
} from '../../types.js'

export type ApplyOpResult = JSONContent | JSONContent[] | null
