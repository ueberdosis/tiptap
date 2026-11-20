import { Document } from '@tiptap/extension-document'
import { BulletList, ListItem, TaskItem, TaskList } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { Marked, marked } from 'marked'
import { describe, expect, it } from 'vite-plus/test'

const withoutTaskList = [Document, Paragraph, Text, BulletList, ListItem]
const withTaskList = [Document, Paragraph, Text, BulletList, ListItem, TaskList, TaskItem]

describe('MarkdownManager marked instance isolation', () => {
  it('keeps one manager’s tokenizers out of another manager', () => {
    const markdown = '- [ ] buy milk\n- [x] walk dog'

    const before = new MarkdownManager({ extensions: withoutTaskList }).parse(markdown)

    new MarkdownManager({ extensions: withTaskList })

    const after = new MarkdownManager({ extensions: withoutTaskList }).parse(markdown)

    expect(after).toEqual(before)
    expect(after.content).toHaveLength(1)
    expect(after.content?.[0].type).toBe('bulletList')
  })

  it('does not register tokenizers on the marked singleton', () => {
    const countBlockExtensions = () => {
      const extensions = (marked as any).defaults?.extensions
      return extensions?.block ? Object.keys(extensions.block).length : 0
    }

    const before = countBlockExtensions()

    new MarkdownManager({ extensions: withTaskList })

    expect(countBlockExtensions()).toBe(before)
  })

  it('does not let markedOptions leak into the marked singleton', () => {
    const before = (marked as any).defaults.breaks

    new MarkdownManager({ markedOptions: { breaks: !before }, extensions: withoutTaskList })

    expect((marked as any).defaults.breaks).toBe(before)
  })

  it('still uses an injected instance, and applies markedOptions to it', () => {
    const injected = new Marked()

    const manager = new MarkdownManager({
      marked: injected,
      markedOptions: { breaks: true },
      extensions: withoutTaskList,
    })

    expect(manager.instance).toBe(injected)
    expect((injected as any).defaults.breaks).toBe(true)
  })
})
