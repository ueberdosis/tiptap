import type { Node as ProseMirrorNode, ResolvedPos } from '@tiptap/pm/model'
import { Selection } from '@tiptap/pm/state'
import type { Mapping } from '@tiptap/pm/transform'

import { getSelectionRanges } from './getSelectionRanges.js'
import { NodeRangeBookmark } from './NodeRangeBookmark.js'

export class NodeRangeSelection extends Selection {
  depth: number | undefined

  constructor($anchor: ResolvedPos, $head: ResolvedPos, depth?: number, bias = 1) {
    // if there is only a cursor we can’t calculate a direction of the selection
    // that’s why we adjust the head position by 1 in the desired direction
    const { doc } = $anchor
    const isCursor = $anchor === $head
    const isCursorAtEnd = $anchor.pos === doc.content.size && $head.pos === doc.content.size
    const $correctedHead = isCursor && !isCursorAtEnd ? doc.resolve($head.pos + (bias > 0 ? 1 : -1)) : $head
    const $correctedAnchor = isCursor && isCursorAtEnd ? doc.resolve($anchor.pos - (bias > 0 ? 1 : -1)) : $anchor

    const ranges = getSelectionRanges($correctedAnchor.min($correctedHead), $correctedAnchor.max($correctedHead), depth)

    // get the smallest range start position
    // this will become the $anchor
    const $rangeFrom = $correctedHead.pos >= $anchor.pos ? ranges[0].$from : ranges[ranges.length - 1].$to

    // get the biggest range end position
    // this will become the $head
    const $rangeTo = $correctedHead.pos >= $anchor.pos ? ranges[ranges.length - 1].$to : ranges[0].$from

    super($rangeFrom, $rangeTo, ranges)

    this.depth = depth
  }

  // we can safely ignore this TypeScript error: https://github.com/Microsoft/TypeScript/issues/338
  // @ts-ignore
  get $to() {
    return this.ranges[this.ranges.length - 1].$to
  }

  eq(other: Selection): boolean {
    return other instanceof NodeRangeSelection && other.$from.pos === this.$from.pos && other.$to.pos === this.$to.pos
  }

  map(doc: ProseMirrorNode, mapping: Mapping): NodeRangeSelection {
    const $anchor = doc.resolve(mapping.map(this.anchor))
    const $head = doc.resolve(mapping.map(this.head))

    return new NodeRangeSelection($anchor, $head)
  }

  toJSON() {
    return {
      type: 'nodeRange',
      anchor: this.anchor,
      head: this.head,
    }
  }

  get isForwards(): boolean {
    return this.head >= this.anchor
  }

  get isBackwards(): boolean {
    return !this.isForwards
  }

  extendBackwards(): NodeRangeSelection {
    const { doc } = this.$from

    if (this.isForwards && this.ranges.length > 1) {
      const ranges = this.ranges.slice(0, -1)
      const $from = ranges[0].$from
      const $to = ranges[ranges.length - 1].$to

      return new NodeRangeSelection($from, $to, this.depth)
    }

    const firstRange = this.ranges[0]
    const $from = doc.resolve(Math.max(0, firstRange.$from.pos - 1))

    return new NodeRangeSelection(this.$anchor, $from, this.depth)
  }

  extendForwards(): NodeRangeSelection {
    const { doc } = this.$from

    if (this.isBackwards && this.ranges.length > 1) {
      const ranges = this.ranges.slice(1)
      const $from = ranges[0].$from
      const $to = ranges[ranges.length - 1].$to

      return new NodeRangeSelection($to, $from, this.depth)
    }

    const lastRange = this.ranges[this.ranges.length - 1]
    const $to = doc.resolve(Math.min(doc.content.size, lastRange.$to.pos + 1))

    return new NodeRangeSelection(this.$anchor, $to, this.depth)
  }

  static fromJSON(doc: ProseMirrorNode, json: any): NodeRangeSelection {
    return new NodeRangeSelection(doc.resolve(json.anchor), doc.resolve(json.head))
  }

  static create(doc: ProseMirrorNode, anchor: number, head: number, depth?: number, bias = 1): NodeRangeSelection {
    return new this(doc.resolve(anchor), doc.resolve(head), depth, bias)
  }

  getBookmark(): NodeRangeBookmark {
    return new NodeRangeBookmark(this.anchor, this.head)
  }
}

NodeRangeSelection.prototype.visible = false
