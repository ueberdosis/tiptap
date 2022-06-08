import { Selection } from 'prosemirror-state'

import { Predicate } from '../types'
import { findParentNodeClosestToPos } from './findParentNodeClosestToPos'

export function findParentNode(predicate: Predicate) {
  return (selection: Selection) => findParentNodeClosestToPos(selection.$from, predicate)
}
