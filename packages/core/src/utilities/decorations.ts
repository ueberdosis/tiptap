import type { Transaction } from '@tiptap/pm/state'
import type { Decoration, DecorationSet } from '@tiptap/pm/view'

/**
 * Finds removed and added decorations from one decoration set to the next
 * and removes/adds them on the old decoration set - returns the updated old decoration set
 * check is done by new mapped position & specs
 * @param transaction The transaction to apply
 * @param oldDecorationSet The old decoration set
 * @param newDecorationSet The new decoration set
 */
export function findDecoUpdates(
  tr: Transaction,
  oldDecorationSet: DecorationSet,
  newDecorationSet: DecorationSet,
): DecorationSet {
  // map the old decoration to the updated positions
  let mappedOldDecorations = oldDecorationSet.map(tr.mapping, tr.doc)

  const oldDecorations = mappedOldDecorations.find()
  const newDecorations = newDecorationSet.find()

  const decosToRemove: Decoration[] = []
  const decosToAdd: Decoration[] = []

  // lets find decorations on the old decorations that are not in the new decorations
  oldDecorations.forEach(oldDeco => {
    const isSame = newDecorations.some(newDeco => {
      return oldDeco.from === newDeco.from && oldDeco.to === newDeco.to && oldDeco.spec?.name === newDeco.spec?.name
    })

    if (!isSame) {
      decosToRemove.push(oldDeco)
    }
  })

  // lets find new decorations that are not in the old decorations
  newDecorations.forEach(newDeco => {
    const isSame = oldDecorations.some(oldDeco => {
      return oldDeco.from === newDeco.from && oldDeco.to === newDeco.to && oldDeco.spec?.name === newDeco.spec?.name
    })

    if (!isSame) {
      decosToAdd.push(newDeco)
    }
  })

  if (decosToRemove.length > 0) {
    mappedOldDecorations = mappedOldDecorations.remove(decosToRemove)
  }

  if (decosToAdd.length > 0) {
    mappedOldDecorations = mappedOldDecorations.add(tr.doc, decosToAdd)
  }

  return mappedOldDecorations
}
