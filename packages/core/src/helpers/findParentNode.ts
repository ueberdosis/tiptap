import { Selection } from '@tiptap/pm/state'

import { Predicate } from '../types.js'
import { findParentNodeClosestToPos } from './findParentNodeClosestToPos.js'

/**
 * Finds the closest parent node to the current selection that matches a predicate.
 * @param predicate The predicate to match
 * @returns A command that finds the closest parent node to the current selection that matches the predicate
 * @example ```js
 * findParentNode(node => node.type.name === 'paragraph')
 * ```
 */
export function findParentNode(predicate: Predicate) {
  return (selection: Selection) => findParentNodeClosestToPos(selection.$from, predicate)
}
