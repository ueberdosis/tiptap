/** Trailing-`<br>` PM injects at the end of empty blocks. */

import type { TagParseRule } from '@tiptap/pm/model'

import { ReactViewDesc } from './base.js'
import { type DOMNode, NOT_DIRTY } from './types.js'

export class ReactTrailingHackViewDesc extends ReactViewDesc {
  constructor(parent: ReactViewDesc | undefined, dom: DOMNode) {
    super(parent, [], dom, null)
  }

  override parseRule(): Omit<TagParseRule, 'tag'> | null {
    return { ignore: true }
  }

  override matchesHack(nodeName: string): boolean {
    return this.dirty === NOT_DIRTY && this.dom.nodeName === nodeName
  }

  override get domAtom(): boolean {
    return true
  }

  override get isTrailingHack(): boolean {
    return true
  }
}
