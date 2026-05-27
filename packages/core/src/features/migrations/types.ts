import type { JSONContent } from '../../types.js'

export type {
  MigrationOperation,
  RemoveAttrOp,
  RenameAttrOp,
  RenameNodeOp,
  SetAttrOp,
  UnwrapNodeOp,
  WrapNodeOp,
} from '../../types.js'

export type ApplyOpResult = JSONContent | JSONContent[] | null
