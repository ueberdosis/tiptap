import type { Content, MarkdownToken } from '@tiptap/core'
import type { Fragment, Node } from '@tiptap/pm/model'

import type { ContentType } from './types.js'

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
 * Identifies marks that need to be closed (active but not in current node).
 */
export function findMarksToClose(activeMarks: Map<string, any>, currentMarks: Map<string, any>): string[] {
  const marksToClose: string[] = []
  Array.from(activeMarks.keys()).forEach(markType => {
    if (!currentMarks.has(markType)) {
      marksToClose.push(markType)
    }
  })
  return marksToClose
}

/**
 * Identifies marks that need to be opened (in current node but not active).
 */
export function findMarksToOpen(
  activeMarks: Map<string, any>,
  currentMarks: Map<string, any>,
): Array<{ type: string; mark: any }> {
  const marksToOpen: Array<{ type: string; mark: any }> = []
  Array.from(currentMarks.entries()).forEach(([markType, mark]) => {
    if (!activeMarks.has(markType)) {
      marksToOpen.push({ type: markType, mark })
    }
  })
  return marksToOpen
}

/**
 * Determines which marks need to be closed at the end of the current text node.
 * This handles cases where marks end at node boundaries or when transitioning
 * to nodes with different mark sets.
 */
export function findMarksToCloseAtEnd(
  activeMarks: Map<string, any>,
  currentMarks: Map<string, any>,
  nextNode: any,
  markSetsEqual: (a: Map<string, any>, b: Map<string, any>) => boolean,
): string[] {
  const isLastNode = !nextNode
  const nextNodeHasNoMarks = nextNode && nextNode.type === 'text' && (!nextNode.marks || nextNode.marks.length === 0)
  const nextNodeHasDifferentMarks =
    nextNode &&
    nextNode.type === 'text' &&
    nextNode.marks &&
    !markSetsEqual(currentMarks, new Map(nextNode.marks.map((mark: any) => [mark.type, mark])))

  const marksToCloseAtEnd: string[] = []
  if (isLastNode || nextNodeHasNoMarks || nextNodeHasDifferentMarks) {
    if (nextNode && nextNode.type === 'text' && nextNode.marks) {
      const nextMarks = new Map(nextNode.marks.map((mark: any) => [mark.type, mark]))
      Array.from(activeMarks.keys()).forEach(markType => {
        if (!nextMarks.has(markType)) {
          marksToCloseAtEnd.push(markType)
        }
      })
    } else if (isLastNode || nextNodeHasNoMarks) {
      // Close all active marks
      marksToCloseAtEnd.push(...Array.from(activeMarks.keys()))
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
export function isTaskItem(item: MarkdownToken): { isTask: boolean; checked?: boolean; indentLevel: number } {
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
