import {
  DECORATION_MANAGER_PLUGIN_KEY,
  Decoration,
  Editor,
  Extension,
  liveWidgetKeys,
} from '@tiptap/core'
import type { DecorationSpec } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import type { Decoration as PMDecoration } from '@tiptap/pm/view'
import { describe, expect, it, vi } from 'vite-plus/test'

function createEditor(extension?: Extension, content = '<p>hello world</p>') {
  return new Editor({
    extensions: [Document, Paragraph, Text, ...(extension ? [extension] : [])],
    content,
  })
}

function getDecorations(editor: Editor): PMDecoration[] {
  const set = DECORATION_MANAGER_PLUGIN_KEY.getState(editor.state)?.mergedDecorationSet

  return set ? set.find() : []
}

describe('addDecorations', () => {
  it('does not register a plugin when no extension declares decorations', () => {
    const editor = createEditor()

    expect(DECORATION_MANAGER_PLUGIN_KEY.getState(editor.state)).toBeUndefined()

    editor.destroy()
  })

  it('does not register a plugin when addDecorations returns null', () => {
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () => null,
    })

    const editor = createEditor(extension)

    expect(DECORATION_MANAGER_PLUGIN_KEY.getState(editor.state)).toBeUndefined()

    editor.destroy()
  })

  it('renders inline and widget decorations from create()', () => {
    const extension = Extension.create({
      name: 'deco',
      addDecorations() {
        return {
          create: () => [
            Decoration.Inline(1, 4, { class: 'highlight' }),
            Decoration.Widget(1, () => document.createElement('span'), { key: 'w1' }),
          ],
        }
      },
    })

    const editor = createEditor(extension)

    expect(getDecorations(editor)).toHaveLength(2)

    editor.destroy()
  })

  it('warns when an extension produces duplicate widget keys', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () => ({
        create: () => [
          Decoration.Widget(1, () => document.createElement('span'), { key: 'dup' }),
          Decoration.Widget(2, () => document.createElement('span'), { key: 'dup' }),
        ],
      }),
    })

    const editor = createEditor(extension)

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Duplicate widget decoration key "dup"'),
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('extension "deco"'))

    warn.mockRestore()
    editor.destroy()
  })

  it('warns when two extensions produce the same widget key', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const a = Extension.create({
      name: 'decoA',
      addDecorations: () => ({
        create: () => [
          Decoration.Widget(1, () => document.createElement('span'), { key: 'shared' }),
        ],
      }),
    })
    const b = Extension.create({
      name: 'decoB',
      addDecorations: () => ({
        create: () => [
          Decoration.Widget(2, () => document.createElement('span'), { key: 'shared' }),
        ],
      }),
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, a, b],
      content: '<p>hello world</p>',
    })

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Duplicate widget decoration key "shared"'),
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"decoA"'))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"decoB"'))

    warn.mockRestore()
    editor.destroy()
  })

  it('recomputes on document change by default', () => {
    const create = vi.fn(() => [Decoration.Inline(1, 2, { class: 'x' })])
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
    const create = vi.fn(() => [Decoration.Inline(2, 5, { class: 'x' })])
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
    const create = vi.fn(() => [Decoration.Inline(1, 4, { class: 'x' })])
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

describe('updateDecorations', () => {
  it('force-updates only the named extension', () => {
    const createA = vi.fn(() => [Decoration.Inline(1, 2, { class: 'a' })])
    const createB = vi.fn(() => [Decoration.Inline(2, 3, { class: 'b' })])
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

  it('removes decorations when create() returns an empty array', () => {
    let toggle = true
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () => ({
        create: () => {
          if (!toggle) return []
          return [Decoration.Inline(1, 4, { class: 'x' })]
        },
        shouldUpdate: () => true,
      }),
    })

    const editor = createEditor(extension)
    expect(getDecorations(editor)).toHaveLength(1)

    toggle = false
    editor.commands.updateDecorations()
    expect(getDecorations(editor)).toHaveLength(0)

    editor.destroy()
  })

  it('recomputes decorations correctly after whole-document replacement', () => {
    const create = vi.fn(() => [Decoration.Inline(1, 3, { class: 'x' })])
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () => ({ create, shouldUpdate: () => true }),
    })

    const editor = createEditor(extension)
    expect(create).toHaveBeenCalledTimes(1)

    // Replace the whole document.
    editor.commands.setContent('<p>new content</p>')
    expect(create).toHaveBeenCalledTimes(2)

    const [deco] = getDecorations(editor)
    expect(deco.from).toBe(1)
    expect(deco.to).toBe(3)

    editor.destroy()
  })

  it('keeps widget keys accurate when mapping forward, dropping deleted widgets', () => {
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () => ({
        create: () => [
          Decoration.Widget(6, () => document.createElement('span'), { key: 'w-mid' }),
        ],
        shouldUpdate: () => false,
      }),
    })

    const editor = createEditor(extension)

    expect(liveWidgetKeys(editor).has('w-mid')).toBe(true)

    // Insert before the widget: it survives and the key stays live.
    editor.commands.insertContentAt(1, 'XX')
    expect(liveWidgetKeys(editor).has('w-mid')).toBe(true)

    // Delete the range containing the widget: it is dropped and so is its key.
    editor.commands.deleteRange({ from: 4, to: 11 })
    expect(liveWidgetKeys(editor).has('w-mid')).toBe(false)

    editor.destroy()
  })

  it('maps both extensions forward without recomputing when neither updates', () => {
    const createA = vi.fn(() => [Decoration.Inline(2, 5, { class: 'a' })])
    const createB = vi.fn(() => [Decoration.Inline(6, 9, { class: 'b' })])
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

    // Insert two characters at the start so every decoration shifts by 2.
    editor.commands.insertContentAt(1, 'XX')

    expect(createA.mock.calls.length).toBe(callsA)
    expect(createB.mock.calls.length).toBe(callsB)

    const decos = getDecorations(editor).sort((x, y) => x.from - y.from)

    expect(decos).toHaveLength(2)
    expect(decos[0].from).toBe(4)
    expect(decos[0].to).toBe(7)
    expect(decos[1].from).toBe(8)
    expect(decos[1].to).toBe(11)

    editor.destroy()
  })

  it('replaces only the recomputed extension in the merged decoration set', () => {
    let useUpdatedDecoration = false
    const createA = vi.fn(() => [
      Decoration.Inline(
        1,
        2,
        { class: useUpdatedDecoration ? 'updated' : 'initial' },
        { source: useUpdatedDecoration ? 'updated' : 'initial' },
      ),
    ])
    const createB = vi.fn(() => [
      Decoration.Inline(4, 5, { class: 'stable' }, { source: 'stable' }),
    ])
    const a = Extension.create({
      name: 'decoA',
      addDecorations: () => ({ create: createA, shouldUpdate: () => true }),
    })
    const b = Extension.create({
      name: 'decoB',
      addDecorations: () => ({ create: createB, shouldUpdate: () => false }),
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, a, b],
      content: '<p>hello world</p>',
    })

    useUpdatedDecoration = true
    editor.commands.updateDecorations('decoA')

    const decos = getDecorations(editor).sort((x, y) => x.from - y.from)

    expect(decos).toHaveLength(2)
    expect(decos[0].spec.source).toBe('updated')
    expect(decos[1].spec.source).toBe('stable')
    expect(createA).toHaveBeenCalledTimes(2)
    expect(createB).toHaveBeenCalledTimes(1)

    editor.destroy()
  })

  it('does not create new plugin state when nothing changed (returns previous)', () => {
    const create = vi.fn(() => [Decoration.Inline(1, 4, { class: 'x' })])
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () => ({ create }),
    })

    const editor = createEditor(extension)
    const state1 = DECORATION_MANAGER_PLUGIN_KEY.getState(editor.state)

    // Selection-only change — should reuse previous state.
    editor.commands.setTextSelection(3)
    const state2 = DECORATION_MANAGER_PLUGIN_KEY.getState(editor.state)

    expect(state1).toBe(state2)

    editor.destroy()
  })

  it('maps manual decorations until updateDecorations() is called', () => {
    let enabled = true
    const create = vi.fn(() => (enabled ? [Decoration.Inline(1, 2)] : []))
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () => ({ update: 'manual', create }),
    })
    const editor = createEditor(extension)
    const callsAfterInit = create.mock.calls.length

    enabled = false
    editor.commands.insertContentAt(1, 'XX')

    expect(create).toHaveBeenCalledTimes(callsAfterInit)
    expect(getDecorations(editor)).toHaveLength(1)

    editor.commands.updateDecorations()

    expect(create).toHaveBeenCalledTimes(callsAfterInit + 1)
    expect(getDecorations(editor)).toHaveLength(0)

    editor.destroy()
  })

  it('rejects a changedRanges strategy without createInRange()', () => {
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () =>
        ({ update: 'changedRanges', create: () => [] }) as unknown as DecorationSpec,
    })

    expect(() => createEditor(extension)).toThrow('does not provide createInRange()')
  })

  it('rejects createInRange() without the changedRanges strategy', () => {
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () =>
        ({
          create: () => [],
          createInRange: () => [],
        }) as unknown as DecorationSpec,
    })

    expect(() => createEditor(extension)).toThrow(
      'provides createInRange() but does not use the "changedRanges" decoration update strategy',
    )
  })
})
