import {
  type GetUpdatedPositionResult,
  getUpdatedPosition as coreGetUpdatedPosition,
  MappablePosition,
} from '@tiptap/core'
import type { EditorState, Transaction } from '@tiptap/pm/state'

import { isChangeOrigin } from './isChangeOrigin.js'
import { type YRelativePosition, getYAbsolutePosition, getYRelativePosition } from './yRelativePosition.js'

/**
 * A MappablePosition subclass that includes Y.js relative position information
 * to track positions in collaborative transactions.
 */
export class CollaborationMappablePosition extends MappablePosition {
  /**
   * The Y.js relative position used for mapping positions in collaborative editing.
   */
  public yRelativePosition: YRelativePosition

  constructor(position: number, yRelativePosition: YRelativePosition) {
    super(position)
    this.yRelativePosition = yRelativePosition
  }

  /**
   * Creates a CollaborationMappablePosition from a JSON object.
   */
  static fromJSON(json: any): CollaborationMappablePosition {
    return new CollaborationMappablePosition(json.position, json.yRelativePosition)
  }

  /**
   * Converts the CollaborationMappablePosition to a JSON object.
   */
  toJSON(): any {
    return {
      position: this.position,
      yRelativePosition: this.yRelativePosition,
    }
  }
}

/**
 * Creates a MappablePosition from a position number.
 * This is the collaboration implementation that returns a CollaborationMappablePosition.
 */
export function createMappablePosition(position: number, state: EditorState): CollaborationMappablePosition {
  const yRelativePosition = getYRelativePosition(state, position)
  return new CollaborationMappablePosition(position, yRelativePosition)
}

/**
 * Returns the new position after applying a transaction. Handles both Y.js
 * transactions and regular transactions.
 */
export function getUpdatedPosition(
  position: MappablePosition,
  transaction: Transaction,
  state: EditorState,
): GetUpdatedPositionResult {
  const yRelativePosition = position instanceof CollaborationMappablePosition ? position.yRelativePosition : null

  if (isChangeOrigin(transaction) && yRelativePosition) {
    const absolutePosition = getYAbsolutePosition(state, yRelativePosition)

    return {
      position: new CollaborationMappablePosition(absolutePosition, yRelativePosition),
      mapResult: null,
    }
  }

  const result = coreGetUpdatedPosition(position, transaction)

  const absolutePosition = result.position.position

  return {
    position: new CollaborationMappablePosition(
      absolutePosition,
      yRelativePosition ?? getYRelativePosition(state, absolutePosition),
    ),
    mapResult: result.mapResult,
  }
}
