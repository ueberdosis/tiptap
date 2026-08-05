import type { Transaction } from '@tiptap/pm/state'

/**
 * Where a tracked position ended up, and whether the content it pointed at is gone.
 */
export interface TrackerResult {
  position: number
  deleted: boolean
}

/**
 * Follows a document position while a transaction changes the document around it.
 */
export class Tracker {
  transaction: Transaction

  currentStep: number

  constructor(transaction: Transaction) {
    this.transaction = transaction
    this.currentStep = this.transaction.steps.length
  }

  map(position: number): TrackerResult {
    let deleted = false

    const mappedPosition = this.transaction.steps
      .slice(this.currentStep)
      .reduce((newPosition, step) => {
        const mapResult = step.getMap().mapResult(newPosition)

        if (mapResult.deleted) {
          deleted = true
        }

        return mapResult.pos
      }, position)

    return {
      position: mappedPosition,
      deleted,
    }
  }
}
