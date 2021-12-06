import { Selection } from 'prosemirror-state'
import { findParentNodeClosestToPos } from './findParentNodeClosestToPos'
import { Predicate } from '../types'

export function findParentNode(predicate: Predicate) {
  return (selection: Selection) => findParentNodeClosestToPos(selection.$from, predicate)
}
