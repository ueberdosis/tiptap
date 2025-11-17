import type { Transaction } from '@tiptap/pm/state'

import type { Editor } from './Editor.js'
import type { Range } from './types.js'

export class UtilityManager {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  public constructor(private parent: Editor) {}

  /**
   * Maps the position of a position through a transaction's steps.
   * @param tr The transaction to map through.
   * @param pos The position to map.
   * @returns The mapped position.
   * @see https://prosemirror.net/docs/ref/#transform.Mapping.map
   */
  public mapPosition(tr: Transaction, pos: number): number {
    return tr.mapping.map(pos)
  }

  /**
   * Maps a range through a transaction's steps.
   * @param tr The transaction to map through.
   * @param range The range to map.
   * @returns The mapped range.
   * @see https://prosemirror.net/docs/ref/#transform.Mapping.map
   */
  public mapRange(tr: Transaction, range: Range): Range {
    return {
      from: this.mapPosition(tr, range.from),
      to: this.mapPosition(tr, range.to),
    }
  }
}
