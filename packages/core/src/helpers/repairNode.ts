import type { ContentMatch, NodeType } from '@tiptap/pm/model'
import { Fragment, Mark, Node as ProseMirrorNode } from '@tiptap/pm/model'

type FittedChildren = {
  children: ProseMirrorNode[]
  match: ContentMatch
  /**
   * Nodes that cannot live in this parent, like a block node inside a paragraph.
   * They move up to the next parent instead of being thrown away.
   */
  leftovers: ProseMirrorNode[]
  changed: boolean
}

type RepairedContent = {
  content: Fragment
  leftovers: ProseMirrorNode[]
  /**
   * `false` when the parent can never be valid, so the caller drops the parent
   * and keeps its content.
   */
  complete: boolean
}

/**
 * Normalizes a mark set and removes marks the parent does not allow.
 * `Mark.setFrom` only sorts, so a node built from JSON can hold duplicate or
 * mutually excluding marks that `node.check()` rejects.
 */
function repairMarks(node: ProseMirrorNode, parentType?: NodeType): ProseMirrorNode {
  const normalized = node.marks.reduce<readonly Mark[]>(
    (marks, mark) => mark.addToSet(marks),
    Mark.none,
  )
  const allowed = parentType ? parentType.allowedMarks(normalized) : normalized

  // `mark()` instead of `copy()` because `TextNode` only overrides `mark()`.
  return Mark.sameSet(allowed, node.marks) ? node : node.mark(allowed)
}

/**
 * Wraps a node in the given types, outermost first, as returned by `findWrapping`.
 */
function wrapNode(node: ProseMirrorNode, wrapping: readonly NodeType[]): ProseMirrorNode | null {
  let wrapped = repairMarks(node, wrapping[wrapping.length - 1])

  for (let index = wrapping.length - 1; index >= 0; index -= 1) {
    // `createAndFill` because a wrapper can require children of its own, like `table` needs `tableRow`.
    const parent = wrapping[index].createAndFill(null, wrapped)

    if (!parent) {
      return null
    }

    wrapped = parent
  }

  return wrapped
}

/**
 * Places a single child, wrapping it when the parent needs levels in between.
 * Returns `null` if the child cannot be placed here at all.
 */
function placeChild(
  match: ContentMatch,
  parentType: NodeType,
  child: ProseMirrorNode,
): { node: ProseMirrorNode; match: ContentMatch } | null {
  const matchAfterChild = match.matchType(child.type)

  if (matchAfterChild) {
    return { node: repairMarks(child, parentType), match: matchAfterChild }
  }

  const wrapping = match.findWrapping(child.type)
  const wrapped = wrapping?.length ? wrapNode(child, wrapping) : null
  const matchAfterWrapped = wrapped ? match.matchType(wrapped.type) : null

  if (wrapped && matchAfterWrapped) {
    return { node: wrapped, match: matchAfterWrapped }
  }

  return null
}

/**
 * Places the nodes into `parentType`. A node that does not fit is unwrapped to give
 * its children a chance, and passed up as a leftover when it has no children.
 */
function fitChildren(parentType: NodeType, nodes: ProseMirrorNode[]): FittedChildren {
  const children: ProseMirrorNode[] = []
  const leftovers: ProseMirrorNode[] = []
  let queue = nodes
  let match = parentType.contentMatch
  let changed = false

  // Every round removes one node from the queue, and unwrapping replaces a node with
  // its children, so the pending count always shrinks and this cannot loop forever.
  while (queue.length) {
    const child = queue.shift() as ProseMirrorNode
    const placed = placeChild(match, parentType, child)

    if (placed) {
      changed = changed || placed.node !== child
      match = placed.match
      children.push(placed.node)
      continue
    }

    changed = true

    if (!child.childCount) {
      leftovers.push(child)
      continue
    }

    const lifted: ProseMirrorNode[] = []

    child.content.forEach(grandChild => lifted.push(grandChild))
    // `concat` instead of `unshift(...lifted)` to stay below the argument limit.
    queue = lifted.concat(queue)
  }

  return { children, match, leftovers, changed }
}

/**
 * Repairs every child first, so placement runs on nodes that are valid inside.
 */
function repairChildren(content: Fragment): { nodes: ProseMirrorNode[]; changed: boolean } {
  const nodes: ProseMirrorNode[] = []
  let changed = false

  content.forEach(child => {
    const repaired = repairChild(child)

    if (repaired !== child) {
      changed = true
    }

    if (repaired instanceof Fragment) {
      repaired.forEach(liftedChild => nodes.push(liftedChild))
      return
    }

    nodes.push(repaired)
  })

  return { nodes, changed }
}

/**
 * Fits the content into what `parentType` allows.
 */
function repairContent(parentType: NodeType, content: Fragment): RepairedContent {
  const repaired = repairChildren(content)
  const fitted = fitChildren(parentType, repaired.nodes)
  const changed = repaired.changed || fitted.changed
  const { leftovers } = fitted

  if (fitted.match.validEnd) {
    return {
      content: changed ? Fragment.fromArray(fitted.children) : content,
      leftovers,
      complete: true,
    }
  }

  const fill = fitted.match.fillBefore(Fragment.empty, true)

  if (!fill) {
    return { content: Fragment.fromArray(fitted.children), leftovers, complete: false }
  }

  return {
    content: Fragment.fromArray(fitted.children).append(fill),
    leftovers,
    complete: true,
  }
}

/**
 * Repairs a child node. Returns a `Fragment` when the node itself has to go, or
 * when content had to move out of it.
 */
function repairChild(node: ProseMirrorNode): ProseMirrorNode | Fragment {
  // A text node must never be copied, `copy()` would drop its text. Leaves are always valid.
  if (node.isText || node.type.isLeaf) {
    return node
  }

  const { content, leftovers, complete } = repairContent(node.type, node.content)

  if (!complete) {
    return Fragment.fromArray([...content.content, ...leftovers])
  }

  if (!leftovers.length) {
    return node.copy(content)
  }

  // Everything moved out, so keep only the moved content instead of an empty node.
  if (!content.childCount && node.content.childCount) {
    return Fragment.fromArray(leftovers)
  }

  return Fragment.fromArray([node.copy(content), ...leftovers])
}

/**
 * Makes a node satisfy its schema again, keeping as much content as possible.
 *
 * Children in an impossible position are wrapped, unwrapped or moved up to a
 * parent that allows them, missing required children are added and invalid marks
 * are removed. Content that fits nowhere is dropped.
 *
 * @param node The node to repair
 * @returns A schema valid node, or `null` if the node type can never be valid
 * @example
 * const doc = schema.nodeFromJSON({ type: 'doc', content: [{ type: 'doc', content: [] }] })
 *
 * repairNode(doc)?.toJSON() // { type: 'doc', content: [{ type: 'paragraph' }] }
 */
export function repairNode(node: ProseMirrorNode): ProseMirrorNode | null {
  if (node.isText || node.type.isLeaf) {
    return repairMarks(node)
  }

  const { content, complete } = repairContent(node.type, node.content)

  if (!complete) {
    return null
  }

  return repairMarks(node.copy(content))
}
