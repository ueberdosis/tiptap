import { EditorState } from '@tiptap/pm/state'

import { ExtensionManager } from '../ExtensionManager'

export function getActiveSplittableMarks(state: EditorState, extensionManager: ExtensionManager) {
  const { splittableMarks } = extensionManager
  const { selection, storedMarks } = state

  const activeMarks = storedMarks || (selection.$to.parentOffset && selection.$from.marks())

  if (!activeMarks) {
    return []
  }

  return activeMarks.filter(mark => splittableMarks.includes(mark.type.name))
}
