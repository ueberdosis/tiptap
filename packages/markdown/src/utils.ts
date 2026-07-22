import { attrsEqual } from '@tiptap/core'
import type { Content, MarkdownToken } from '@tiptap/core'
import type { Fragment, Node } from '@tiptap/pm/model'

import type { ContentType } from './types.js'

/**
 * Matches a run of two or more consecutive line breaks (a blank line) at the
 * end of a string, allowing horizontal whitespace between the breaks.
 *
 * @example
 * TRAILING_BLANK_LINES.test('paragraph\n  \n')
 * // => true
 */
const TRAILING_BLANK_LINES = /\n[^\S\n]*(?:\n[^\S\n]*)+$/

/**
 * Extracts blank lines absorbed into marked token `raw` back into explicit
 * `space` tokens so they're handled uniformly by the reconstruction path.
 * @param tokens The marked token stream to normalize.
 * @returns A new token array with absorbed blank lines as `space` tokens.
 */
export function extractAbsorbedBlankLines(tokens: MarkdownToken[]): MarkdownToken[] {
  return tokens.flatMap((token, index) => {
    // A following `space` token already carries the blank lines for this gap.
    if (token.type === 'space' || tokens[index + 1]?.type === 'space') {
      return [token]
    }

    const trailingBlankLines = (token.raw || '').match(TRAILING_BLANK_LINES)

    if (!trailingBlankLines) {
      return [token]
    }

    return [
      { ...token, raw: (token.raw || '').slice(0, -trailingBlankLines[0].length) },
      { type: 'space', raw: trailingBlankLines[0] } as MarkdownToken,
    ]
  })
}

/**
 * Wraps each line of the content with the given prefix.
 * @param prefix The prefix to wrap each line with.
 * @param content The content to wrap.
 * @returns The content with each line wrapped with the prefix.
 */
export function wrapInMarkdownBlock(prefix: string, content: string) {
  // split content lines
  const lines = content.split('\n')

  // add empty strings between every line
  const output = lines
    // add empty lines between each block
    .flatMap(line => [line, ''])
    // add the prefix to each line
    .map(line => `${prefix}${line}`)
    .join('\n')

  return output.slice(0, output.length - 1)
}

/**
 * Determines which marks to close based on the next node's marks,
 * treating same-type marks with different attributes as distinct.
 */
export function findMarksToClose(currentMarks: Map<string, any>, nextNode: any): string[] {
  const marksToClose: string[] = []

  Array.from(currentMarks.entries()).forEach(([markType, currentMark]) => {
    if (!nextNode) {
      marksToClose.push(markType)
      return
    }

    // Check if the next node has a mark of the same type with matching attributes
    const nextMark = (nextNode.marks || []).find(
      (mark: any) => mark.type === markType && attrsEqual(mark.attrs, currentMark.attrs),
    )

    if (!nextMark) {
      marksToClose.push(markType)
    }
  })
  return marksToClose
}

/**
 * Determines which marks need to open, treating same-type marks with
 * different attributes as distinct (close + reopen).
 */
export function findMarksToOpen(
  activeMarks: Map<string, any>,
  currentMarks: Map<string, any>,
): Array<{ type: string; mark: any }> {
  const marksToOpen: Array<{ type: string; mark: any }> = []
  Array.from(currentMarks.entries()).forEach(([markType, mark]) => {
    const activeMark = activeMarks.get(markType)

    // Open if the mark type is not active, or if the attributes differ
    if (!activeMark || !attrsEqual(activeMark.attrs, mark.attrs)) {
      marksToOpen.push({ type: markType, mark })
    }
  })
  return marksToOpen
}

/**
 * Determines which marks to close at the node end, treating same-type marks
 * with different attributes as distinct (close + reopen).
 */
export function findMarksToCloseAtEnd(
  activeMarks: Map<string, any>,
  currentMarks: Map<string, any>,
  nextNode: any,
  markSetsEqual: (a: Map<string, { type: string }>, b: Map<string, { type: string }>) => boolean,
): string[] {
  const isLastNode = !nextNode
  const nextNodeHasNoMarks = nextNode && (!nextNode.marks || nextNode.marks.length === 0)
  const nextNodeHasDifferentMarks =
    nextNode &&
    nextNode.marks &&
    !markSetsEqual(currentMarks, new Map(nextNode.marks.map((mark: any) => [mark.type, mark])))

  const marksToCloseAtEnd: string[] = []
  if (isLastNode || nextNodeHasNoMarks || nextNodeHasDifferentMarks) {
    if (nextNode && nextNode.marks) {
      Array.from(activeMarks.entries())
        .reverse()
        .forEach(([markType, activeMark]) => {
          // Check if nextNode has a mark of the same type with matching attrs
          const nextMark = nextNode.marks.find(
            (m: any) => m.type === markType && attrsEqual(m.attrs, activeMark.attrs),
          )
          if (!nextMark) {
            marksToCloseAtEnd.push(markType)
          }
        })
    } else if (isLastNode || nextNodeHasNoMarks) {
      // Close all active marks
      marksToCloseAtEnd.push(...Array.from(activeMarks.keys()).reverse())
    }
  }

  return marksToCloseAtEnd
}

/**
 * Closes active marks before rendering a non-text node.
 * Returns the closing markdown syntax and clears the active marks.
 */
export function closeMarksBeforeNode(
  activeMarks: Map<string, any>,
  getMarkClosing: (markType: string, mark: any) => string,
): string {
  let beforeMarkdown = ''
  Array.from(activeMarks.keys())
    .reverse()
    .forEach(markType => {
      const mark = activeMarks.get(markType)
      const closeMarkdown = getMarkClosing(markType, mark)
      if (closeMarkdown) {
        beforeMarkdown = closeMarkdown + beforeMarkdown
      }
    })
  activeMarks.clear()
  return beforeMarkdown
}

/**
 * Reopens marks after rendering a non-text node.
 * Returns the opening markdown syntax and updates the active marks.
 */
export function reopenMarksAfterNode(
  marksToReopen: Map<string, any>,
  activeMarks: Map<string, any>,
  getMarkOpening: (markType: string, mark: any) => string,
): string {
  let afterMarkdown = ''
  Array.from(marksToReopen.entries()).forEach(([markType, mark]) => {
    const openMarkdown = getMarkOpening(markType, mark)
    if (openMarkdown) {
      afterMarkdown += openMarkdown
    }
    activeMarks.set(markType, mark)
  })
  return afterMarkdown
}

/**
 * Check if a markdown list item token is a task item and extract its state.
 *
 * @param item The list item token to check
 * @returns Object containing isTask flag, checked state, and indentation level
 *
 * @example
 * ```ts
 * isTaskItem({ raw: '- [ ] Task' }) // { isTask: true, checked: false, indentLevel: 0 }
 * isTaskItem({ raw: '  - [x] Done' }) // { isTask: true, checked: true, indentLevel: 2 }
 * isTaskItem({ raw: '- Regular' }) // { isTask: false, indentLevel: 0 }
 * ```
 */
export function isTaskItem(item: MarkdownToken): {
  isTask: boolean
  checked?: boolean
  indentLevel: number
} {
  const raw = item.raw || item.text || ''

  // Match patterns like "- [ ] " or "  - [x] "
  const match = raw.match(/^(\s*)[-+*]\s+\[([ xX])\]\s+/)

  if (match) {
    return { isTask: true, checked: match[2].toLowerCase() === 'x', indentLevel: match[1].length }
  }
  return { isTask: false, indentLevel: 0 }
}

/**
 * Assumes the content type based off the content.
 * @param content The content to assume the type for.
 * @param contentType The content type that should be prioritized.
 */
export function assumeContentType(
  content: (Content | Fragment | Node) | string,
  contentType: ContentType,
): ContentType {
  // if not a string, we assume it will be a json content object
  if (typeof content !== 'string') {
    return 'json'
  }

  // otherwise we let the content type be what it is
  return contentType
}
