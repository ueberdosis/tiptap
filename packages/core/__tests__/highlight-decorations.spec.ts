import { Editor, Node } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import type { Decoration } from '@tiptap/pm/view'
import { describe, expect, it } from 'vitest'

import { decorationManagerKey } from '../src/features/decorations/DecorationManager.js'
import { HighlightDecorations as ReactHighlightDecorations } from '../../../demos/src/Examples/Decorations/React/highlight-decorations.js'
import { HighlightDecorations as VueHighlightDecorations } from '../../../demos/src/Examples/Decorations/Vue/highlight-decorations.js'

const Heading = Node.create({
  name: 'heading',
  group: 'block',
  content: 'inline*',
  parseHTML: () => [{ tag: 'h1' }],
  renderHTML: () => ['h1', 0],
})

function createEditor(extension: typeof ReactHighlightDecorations, term: string) {
  return new Editor({
    extensions: [Document, Paragraph, Text, Heading, extension.configure({ term })],
    content: '<h1>Tiptap</h1><p>Tiptap tiptap</p>',
  })
}

function getDecorations(editor: Editor): Decoration[] {
  return decorationManagerKey.getState(editor.state)?.mergedDecorationSet.find() ?? []
}

describe.each([
  ['React', ReactHighlightDecorations],
  ['Vue', VueHighlightDecorations],
])('%s HighlightDecorations', (_framework, extension) => {
  it('creates heading, inline, and widget decorations for every match', () => {
    const editor = createEditor(extension, 'tiptap')
    const decorations = getDecorations(editor)
    const heading = decorations.filter(
      decoration => decoration.type.attrs?.class === 'decoration-heading',
    )
    const highlights = decorations.filter(
      decoration => decoration.type.attrs?.class === 'decoration-highlight',
    )
    const widgets = decorations.filter(decoration =>
      (decoration.spec as { key?: string }).key?.startsWith('highlight-marker-'),
    )

    expect(heading).toHaveLength(1)
    expect(heading[0]).toMatchObject({ from: 0, to: 8 })
    expect(highlights.map(decoration => [decoration.from, decoration.to])).toEqual([
      [1, 7],
      [9, 15],
      [16, 22],
    ])
    expect(widgets.map(decoration => (decoration.spec as { key: string }).key)).toEqual([
      'highlight-marker-1',
      'highlight-marker-9',
      'highlight-marker-16',
    ])

    const marker = (widgets[0].type as any).toDOM(null, () => widgets[0].from)

    expect(marker).toMatchObject({ className: 'decoration-marker', textContent: '★' })
    editor.destroy()
  })

  it.each(['missing', '   '])('keeps only heading decorations for a %j term', term => {
    const editor = createEditor(extension, term)
    const decorations = getDecorations(editor)

    expect(
      decorations.filter(decoration => decoration.type.attrs?.class === 'decoration-heading'),
    ).toHaveLength(1)
    expect(
      decorations.filter(decoration => decoration.type.attrs?.class === 'decoration-highlight'),
    ).toHaveLength(0)
    expect(
      decorations.filter(decoration =>
        (decoration.spec as { key?: string }).key?.startsWith('highlight-marker-'),
      ),
    ).toHaveLength(0)
    editor.destroy()
  })
})
