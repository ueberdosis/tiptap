import { decoration, decorationManagerKey, Editor, Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import type { Decoration } from '@tiptap/pm/view'
import { describe, expect, it, vi } from 'vitest'

function createEditor(extension?: Extension, content = '<p>hello world</p>') {
  return new Editor({
    extensions: [Document, Paragraph, Text, ...(extension ? [extension] : [])],
    content,
  })
}

function getDecorations(editor: Editor): Decoration[] {
  const set = decorationManagerKey.getState(editor.state)?.combined

  return set ? set.find() : []
}

describe('addDecorations', () => {
  it('does not register a plugin when no extension declares decorations', () => {
    const editor = createEditor()

    expect(decorationManagerKey.getState(editor.state)).toBeUndefined()

    editor.destroy()
  })

  it('renders inline and widget decorations from create()', () => {
    const extension = Extension.create({
      name: 'deco',
      addDecorations() {
        return {
          create: () => [
            decoration.inline(1, 4, { class: 'highlight' }),
            decoration.widget(1, () => document.createElement('span'), { key: 'w1' }),
          ],
        }
      },
    })

    const editor = createEditor(extension)

    expect(getDecorations(editor)).toHaveLength(2)

    editor.destroy()
  })

  it('recomputes on document change by default', () => {
    const create = vi.fn(() => [decoration.inline(1, 2, { class: 'x' })])
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () => ({ create }),
    })

    const editor = createEditor(extension)
    const callsAfterInit = create.mock.calls.length

    editor.commands.insertContent('!')

    expect(create.mock.calls.length).toBeGreaterThan(callsAfterInit)

    editor.destroy()
  })

  it('does not recompute when shouldUpdate returns false, but maps positions forward', () => {
    const create = vi.fn(() => [decoration.inline(2, 5, { class: 'x' })])
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () => ({ create, shouldUpdate: () => false }),
    })

    const editor = createEditor(extension)
    const callsAfterInit = create.mock.calls.length

    // Insert two characters before the decoration so positions shift by 2.
    editor.commands.insertContentAt(1, 'XX')

    expect(create.mock.calls.length).toBe(callsAfterInit)

    const [deco] = getDecorations(editor)

    expect(deco.from).toBe(4)
    expect(deco.to).toBe(7)

    editor.destroy()
  })

  it('does not recompute on a selection-only change', () => {
    const create = vi.fn(() => [decoration.inline(1, 4, { class: 'x' })])
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () => ({ create }),
    })

    const editor = createEditor(extension)
    const callsAfterInit = create.mock.calls.length

    editor.commands.setTextSelection(3)

    expect(create.mock.calls.length).toBe(callsAfterInit)

    editor.destroy()
  })
})

describe('updateDecorations / clearDecorations', () => {
  it('clears all decorations and brings them back on force update', () => {
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () => ({
        create: () => [decoration.inline(1, 4, { class: 'x' })],
        // never recompute on its own, so only the imperative API drives changes
        shouldUpdate: () => false,
      }),
    })

    const editor = createEditor(extension)

    expect(getDecorations(editor)).toHaveLength(1)

    editor.commands.clearDecorations()
    expect(getDecorations(editor)).toHaveLength(0)

    editor.commands.updateDecorations()
    expect(getDecorations(editor)).toHaveLength(1)

    editor.destroy()
  })

  it('force-updates only the named extension', () => {
    const createA = vi.fn(() => [decoration.inline(1, 2, { class: 'a' })])
    const createB = vi.fn(() => [decoration.inline(2, 3, { class: 'b' })])
    const a = Extension.create({
      name: 'decoA',
      addDecorations: () => ({ create: createA, shouldUpdate: () => false }),
    })
    const b = Extension.create({
      name: 'decoB',
      addDecorations: () => ({ create: createB, shouldUpdate: () => false }),
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, a, b],
      content: '<p>hello world</p>',
    })

    const callsA = createA.mock.calls.length
    const callsB = createB.mock.calls.length

    editor.commands.updateDecorations('decoA')

    expect(createA.mock.calls.length).toBe(callsA + 1)
    expect(createB.mock.calls.length).toBe(callsB)

    editor.destroy()
  })
})
