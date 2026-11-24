import { DecorationSet } from '@tiptap/pm/view'
import type { Transaction } from '@tiptap/pm/state'

import type { DecorationManagerState } from '../types.js'
import { mapDecorationSet } from './mapDecorationSet.js'

/**
 * Moves an extension's existing decorations to their new positions after a
 * transaction, and prunes widget keys for any widget whose position was deleted.
 * @param name The name of the decoration extension.
 * @param previous The previous decoration manager state.
 * @param tr The transaction to map through.
 * @returns The updated decoration set and widget keys.
 */
export function mapDecorations(
  name: string,
  previous: DecorationManagerState,
  tr: Transaction,
): { set: DecorationSet; widgetKeys: Set<string> } {
  const previousSet = previous.decorationSetsByExtension[name] ?? DecorationSet.empty
  const widgetKeys = new Set<string>(previous.widgetKeysByExtension[name] ?? [])

  const set = mapDecorationSet(previousSet, tr.mapping, tr.doc, widgetKeys)

  return { set, widgetKeys }
}
