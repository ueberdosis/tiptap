import { Selection } from '@tiptap/pm/state'

import { Predicate } from '../types.js'
import { findParentNodeClosestToPos } from './findParentNodeClosestToPos.js'

export function findParentNode(predicate: Predicate) {
  return (selection: Selection) => findParentNodeClosestToPos(selection.$from, predicate)
}
