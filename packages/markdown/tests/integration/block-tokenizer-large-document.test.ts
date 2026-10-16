import { Document } from '@tiptap/extension-document'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import { Text } from '@tiptap/extension-text'
import { Marked } from 'marked'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../../src/MarkdownManager.js'

// Table's `start` and TaskList's tokenizer are offered the whole rest of the
// document at every block. Splitting it all into lines each time made parsing
// quadratic in document length, even with no table or task list in it (#8458).
const paragraphs = (count: number) =>
  Array.from({ length: count }, (_, index) => `Paragraph ${index} text.`).join('\n\n')

const timeParse = (manager: MarkdownManager, markdown: string) => {
  const startedAt = performance.now()
  manager.parse(markdown)
  return performance.now() - startedAt
}

describe('block tokenizers in large documents', () => {
  const control = [Document, Paragraph, Text]

  it.each([
    ['Table', [...control, Table, TableRow, TableHeader, TableCell]],
    ['TaskList', [...control, TaskList, TaskItem]],
  ])(
    'parses a long document without tables or task lists in roughly linear time with %s',
    (_name, extensions) => {
      const manager = new MarkdownManager({ marked: new Marked(), extensions })
      const markdown = paragraphs(16000)

      // Quadratic scanning took several seconds here; well under a second now.
      // Loose enough for CI.
      expect(timeParse(manager, markdown)).toBeLessThan(2000)
    },
    60000,
  )

  it('still parses a table and a task list after leading blank lines', () => {
    const manager = new MarkdownManager({
      marked: new Marked(),
      extensions: [...control, Table, TableRow, TableHeader, TableCell, TaskList, TaskItem],
    })

    const json = manager.parse(
      'Intro\n\n| a | b |\n| - | - |\n| 1 | 2 |\n\n\n- [ ] todo\n- [x] done',
    )

    expect(json.content?.map(node => node.type)).toEqual(['paragraph', 'table', 'taskList'])
    expect(json.content?.[2].content?.map(item => item.attrs?.checked)).toEqual([false, true])
  })
})
