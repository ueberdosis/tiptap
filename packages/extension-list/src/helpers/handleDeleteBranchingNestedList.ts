import type { Editor } from '@tiptap/core'

import { hoistBranchingNestedList } from './hoistBranchingNestedList.js'

export const handleDeleteBranchingNestedList = (
  editor: Editor,
  itemName: string,
  wrapperNames: string[],
) => {
  return hoistBranchingNestedList(editor.state, editor.view.dispatch, itemName, wrapperNames)
}
