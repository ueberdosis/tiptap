import { Document } from '@tiptap/extension-document'
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { describe, expect, it } from 'vite-plus/test'

const manager = (indentation?: { style?: 'space' | 'tab'; size?: number }) =>
  new MarkdownManager({
    extensions: [Document, Paragraph, Text, BulletList, OrderedList, ListItem],
    ...(indentation ? { indentation } : {}),
  } as any)

const roundTrip = (mm: MarkdownManager, markdown: string) => mm.serialize(mm.parse(markdown) as any)

const ordered = ['1. one', '   1. inner', '2. two'].join('\n')
const orderedWide = ['10. ten', '    1. inner', '11. eleven'].join('\n')
const bullet = ['- one', '  - inner', '- two'].join('\n')

describe('list indentation on serialize', () => {
  it('indents a nested ordered list to the marker width', () => {
    expect(roundTrip(manager(), ordered)).toBe(ordered)
  })

  it('widens the indent for a marker wider than the indent size', () => {
    expect(roundTrip(manager({ style: 'space', size: 2 }), orderedWide)).toBe(orderedWide)
  })

  it('keeps a configured indent that is already past the marker', () => {
    expect(roundTrip(manager({ style: 'space', size: 4 }), ordered)).toBe(
      ['1. one', '    1. inner', '2. two'].join('\n'),
    )
  })

  it('keeps tab indentation on an ordered list, since a tab clears the marker', () => {
    expect(roundTrip(manager({ style: 'tab', size: 1 }), orderedWide)).toBe(
      ['10. ten', '\t1. inner', '11. eleven'].join('\n'),
    )
  })

  it('leaves bullet lists on the configured indent size', () => {
    expect(roundTrip(manager({ style: 'space', size: 4 }), bullet)).toBe(
      ['- one', '    - inner', '- two'].join('\n'),
    )
  })

  it('leaves bullet lists on tab indentation', () => {
    expect(roundTrip(manager({ style: 'tab', size: 1 }), bullet)).toBe(
      ['- one', '\t- inner', '- two'].join('\n'),
    )
  })
})
