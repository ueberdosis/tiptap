import type { Transaction } from '@tiptap/pm/state'
import type { MapResult } from '@tiptap/pm/transform'

/**
 * A class that represents a mappable position in the editor. It can be extended
 * by other extensions to add additional position mapping capabilities.
 */
export class MappablePosition {
  /**
   * The absolute position in the editor.
   */
  public position: number

  constructor(position: number) {
    this.position = position
  }

  /**
   * Creates a MappablePosition from a JSON object.
   */
  static fromJSON(json: any): MappablePosition {
    return new MappablePosition(json.position)
  }

  /**
   * Converts the MappablePosition to a JSON object.
   */
  toJSON(): any {
    return {
      position: this.position,
    }
  }
}

/**
 * The result of the getUpdatedPosition function.
 */
export interface GetUpdatedPositionResult {
  position: MappablePosition
  mapResult: MapResult | null
}

/**
 * Calculates the new position after applying a transaction.
 *
 * @returns The new mappable position and the map result.
 */
export function getUpdatedPosition(position: MappablePosition, transaction: Transaction): GetUpdatedPositionResult {
  const mapResult = transaction.mapping.mapResult(position.position)
  return {
    position: new MappablePosition(mapResult.pos),
    mapResult,
  }
}

/**
 * Creates a MappablePosition from a position number. This is the default
 * implementation for Tiptap core. It can be overridden by other Tiptap
 * extensions.
 *
 * @param position The position (as a number) where the MappablePosition will be created.
 * @returns A new MappablePosition instance at the given position.
 */
export function createMappablePosition(position: number): MappablePosition {
  return new MappablePosition(position)
}
