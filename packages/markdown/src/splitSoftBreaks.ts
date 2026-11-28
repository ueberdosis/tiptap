import { Fragment, type Node as ProseMirrorNode } from '@tiptap/pm/model'

// Same line rule as the ProseMirror plain text paste
const LINE_BREAK = /(?:\r\n?|\n)+/

function splitParagraph(paragraph: ProseMirrorNode): ProseMirrorNode[] {
  const lines: ProseMirrorNode[][] = [[]]

  paragraph.forEach(child => {
    if (!child.isText) {
      lines[lines.length - 1].push(child)

      return
    }

    child.text!.split(LINE_BREAK).forEach((piece, index) => {
      if (index > 0) {
        lines.push([])
      }

      if (piece) {
        lines[lines.length - 1].push(paragraph.type.schema.text(piece, child.marks))
      }
    })
  })

  const filled = lines.filter(line => line.length > 0)

  if (lines.length === 1 || filled.length === 0) {
    return [paragraph]
  }

  return filled.map(line => paragraph.copy(Fragment.fromArray(line)))
}

function splitNode(node: ProseMirrorNode, splitParagraphs: boolean): ProseMirrorNode[] {
  if (node.type.name === 'paragraph') {
    return splitParagraphs ? splitParagraph(node) : [node]
  }

  if (node.isLeaf) {
    return [node]
  }

  const content = splitFragment(node.content, true)

  if (node.type.validContent(content)) {
    return [node.copy(content)]
  }

  // The parent rejects the extra paragraphs, so its own paragraphs keep their newlines
  return [node.copy(splitFragment(node.content, false))]
}

function splitFragment(fragment: Fragment, splitParagraphs: boolean): Fragment {
  const nodes: ProseMirrorNode[] = []

  fragment.forEach(node => nodes.push(...splitNode(node, splitParagraphs)))

  return Fragment.fromArray(nodes)
}

/**
 * Splits the paragraphs of parsed markdown at soft line breaks, like a plain text paste does.
 * Explicit hard breaks and code blocks are left alone.
 *
 * @param fragment The parsed content.
 * @returns The content with one paragraph per line.
 */
export function splitSoftBreaks(fragment: Fragment): Fragment {
  return splitFragment(fragment, true)
}
