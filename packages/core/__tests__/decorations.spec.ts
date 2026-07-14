import { decoration, Editor, Extension, Node } from '@tiptap/core'
import type { DecorationDescriptor, DecorationSpec } from '@tiptap/core'
import {
  decorationManagerKey,
  liveWidgetKeys,
} from '../src/features/decorations/DecorationManager.js'
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
  const set = decorationManagerKey.getState(editor.state)?.mergedDecorationSet

  return set ? set.find() : []
}

describe('decoration', () => {
  it('creates node descriptors with default attrs', () => {
    expect(decoration.node(1, 4)).toEqual({
      kind: 'node',
      from: 1,
      to: 4,
      attrs: {},
      spec: undefined,
    })
  })

  it('creates inline descriptors with attrs and spec', () => {
    expect(decoration.inline(2, 5, { class: 'highlight' }, { inclusiveStart: true })).toEqual({
      kind: 'inline',
      from: 2,
      to: 5,
      attrs: { class: 'highlight' },
      spec: { inclusiveStart: true },
    })
  })

  it('keeps widget keys out of the ProseMirror spec', () => {
    const render = () => document.createElement('span')

    expect(
      decoration.widget(3, render, { key: 'widget-1', side: -1, stopEvent: () => true }),
    ).toEqual({
      kind: 'widget',
      pos: 3,
      render,
      key: 'widget-1',
      spec: { side: -1, stopEvent: expect.any(Function) },
    })
  })
})

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

  it('warns when an extension produces duplicate widget keys', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () => ({
        create: () => [
          decoration.widget(1, () => document.createElement('span'), { key: 'dup' }),
          decoration.widget(2, () => document.createElement('span'), { key: 'dup' }),
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
          decoration.widget(1, () => document.createElement('span'), { key: 'shared' }),
        ],
      }),
    })
    const b = Extension.create({
      name: 'decoB',
      addDecorations: () => ({
        create: () => [
          decoration.widget(2, () => document.createElement('span'), { key: 'shared' }),
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

describe('updateDecorations', () => {
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

  it('removes decorations when create() returns an empty array', () => {
    let toggle = true
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () => ({
        create: () => {
          if (!toggle) return []
          return [decoration.inline(1, 4, { class: 'x' })]
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
    const create = vi.fn(() => [decoration.inline(1, 3, { class: 'x' })])
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
          decoration.widget(6, () => document.createElement('span'), { key: 'w-mid' }),
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
    const createA = vi.fn(() => [decoration.inline(2, 5, { class: 'a' })])
    const createB = vi.fn(() => [decoration.inline(6, 9, { class: 'b' })])
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
      decoration.inline(
        1,
        2,
        { class: useUpdatedDecoration ? 'updated' : 'initial' },
        { source: useUpdatedDecoration ? 'updated' : 'initial' },
      ),
    ])
    const createB = vi.fn(() => [
      decoration.inline(4, 5, { class: 'stable' }, { source: 'stable' }),
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
    const create = vi.fn(() => [decoration.inline(1, 4, { class: 'x' })])
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () => ({ create }),
    })

    const editor = createEditor(extension)
    const state1 = decorationManagerKey.getState(editor.state)

    // Selection-only change — should reuse previous state.
    editor.commands.setTextSelection(3)
    const state2 = decorationManagerKey.getState(editor.state)

    expect(state1).toBe(state2)

    editor.destroy()
  })

  it('maps manual decorations until updateDecorations() is called', () => {
    let enabled = true
    const create = vi.fn(() => (enabled ? [decoration.inline(1, 2)] : []))
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

describe('changedRanges updates', () => {
  // Decorates every paragraph as a node decoration and highlights each
  // occurrence of "x" as an inline decoration, scanning only [from, to].
  function scan(state: Editor['state'], from: number, to: number) {
    const decorations: DecorationDescriptor[] = []

    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type.name === 'paragraph') {
        decorations.push(
          decoration.node(pos, pos + node.nodeSize, { class: 'para' }, { source: 'paragraph' }),
        )
      }

      if (node.isText && node.text) {
        let index = node.text.indexOf('x')

        while (index !== -1) {
          decorations.push(
            decoration.inline(pos + index, pos + index + 1, { class: 'hit' }, { source: 'hit' }),
          )
          index = node.text.indexOf('x', index + 1)
        }
      }
    })

    return decorations
  }

  function incrementalExtension() {
    const create = vi.fn(({ state }) => scan(state, 0, state.doc.content.size))
    const createInRange = vi.fn(({ state, from, to }) => scan(state, from, to))
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () => ({ update: 'changedRanges', create, createInRange }),
    })

    return { extension, create, createInRange }
  }

  it('rebuilds only the changed block via createInRange, not the whole doc', () => {
    const { extension, create, createInRange } = incrementalExtension()
    const editor = createEditor(extension, '<p>aaa</p><p>bbb</p>')

    expect(create).toHaveBeenCalledTimes(1)
    const callsBefore = createInRange.mock.calls.length

    // Type an "x" into the second paragraph.
    editor.commands.insertContentAt(8, 'x')

    // create() (full scan) did not run again; only createInRange did.
    expect(create).toHaveBeenCalledTimes(1)
    expect(createInRange.mock.calls.length).toBe(callsBefore + 1)

    // The new match is decorated.
    expect(getDecorations(editor).some(d => d.from === 8 && d.to === 9)).toBe(true)

    editor.destroy()
  })

  it('keeps a neighbour block decoration whose edge touches the changed block', () => {
    // Regression: a paragraph node decoration ends exactly at the next block's
    // start. Editing the next block must not drop the previous block's decoration.
    const { extension } = incrementalExtension()
    const editor = createEditor(extension, '<p>aaa</p><p>bbb</p>')

    // Both paragraphs decorated initially (node deco at from=0 and from=5).
    expect(getDecorations(editor).some(d => d.from === 0)).toBe(true)

    // Type into the second paragraph.
    editor.commands.insertContentAt(8, 'z')

    // The first paragraph's node decoration (from=0) must survive.
    expect(getDecorations(editor).some(d => d.from === 0)).toBe(true)

    editor.destroy()
  })

  it('still does a full create on forced updateDecorations()', () => {
    const { extension, create } = incrementalExtension()
    const editor = createEditor(extension, '<p>aaa</p><p>bbb</p>')

    expect(create).toHaveBeenCalledTimes(1)

    editor.commands.updateDecorations()

    expect(create).toHaveBeenCalledTimes(2)

    editor.destroy()
  })

  it('does not call createInRange when shouldUpdate returns false (maps only)', () => {
    const create = vi.fn(({ state }) => scan(state, 0, state.doc.content.size))
    const createInRange = vi.fn(({ state, from, to }) => scan(state, from, to))
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () => ({
        update: 'changedRanges',
        create,
        createInRange,
        shouldUpdate: () => false,
      }),
    })

    const editor = createEditor(extension, '<p>xax</p>')
    const createCalls = create.mock.calls.length
    const rangeCalls = createInRange.mock.calls.length

    // Document changes, but shouldUpdate gates it off → map only.
    editor.commands.insertContentAt(1, 'YY')

    expect(create.mock.calls.length).toBe(createCalls)
    expect(createInRange.mock.calls.length).toBe(rangeCalls)

    // Existing decorations were mapped forward by +2.
    expect(getDecorations(editor).some(d => d.from === 3 && d.to === 4)).toBe(true)

    editor.destroy()
  })

  it('forced updateDecorations(name) runs full create for that extension only, never createInRange', () => {
    const createA = vi.fn(({ state }) => scan(state, 0, state.doc.content.size))
    const createInRangeA = vi.fn(({ state, from, to }) => scan(state, from, to))
    const createB = vi.fn(({ state }) => scan(state, 0, state.doc.content.size))

    const a = Extension.create({
      name: 'decoA',
      addDecorations: () => ({
        update: 'changedRanges',
        create: createA,
        createInRange: createInRangeA,
      }),
    })
    const b = Extension.create({
      name: 'decoB',
      addDecorations: () => ({ create: createB }),
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, a, b],
      content: '<p>xx</p>',
    })

    const aCreate = createA.mock.calls.length
    const aRange = createInRangeA.mock.calls.length
    const bCreate = createB.mock.calls.length

    editor.commands.updateDecorations('decoA')

    expect(createA.mock.calls.length).toBe(aCreate + 1) // full rebuild for the named extension
    expect(createInRangeA.mock.calls.length).toBe(aRange) // never the incremental path
    expect(createB.mock.calls.length).toBe(bCreate) // the other extension is untouched

    editor.destroy()
  })

  it('handles nested structures: edits inside a container rebuild it, siblings survive', () => {
    const Container = Node.create({
      name: 'container',
      group: 'block',
      content: 'paragraph+',
      parseHTML: () => [{ tag: 'div[data-container]' }],
      renderHTML: () => ['div', { 'data-container': '' }, 0],
    })

    const create = vi.fn(({ state }) => scan(state, 0, state.doc.content.size))
    const createInRange = vi.fn(({ state, from, to }) => scan(state, from, to))
    const deco = Extension.create({
      name: 'deco',
      addDecorations: () => ({ update: 'changedRanges', create, createInRange }),
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Container, deco],
      content: '<div data-container><p>aaa</p><p>bbb</p></div><p>ccc</p>',
    })

    // The top-level "ccc" paragraph starts at pos 12 and gets a node decoration.
    expect(getDecorations(editor).some(d => d.from === 12)).toBe(true)
    expect(create).toHaveBeenCalledTimes(1)

    // Type an "x" into a paragraph nested inside the container.
    editor.commands.insertContentAt(3, 'x')

    // Only the incremental path ran (the changed range expands to the whole
    // top-level container, which createInRange rescans).
    expect(create).toHaveBeenCalledTimes(1)
    expect(createInRange.mock.calls.length).toBeGreaterThan(0)

    // The new match inside the container is decorated…
    expect(getDecorations(editor).some(d => d.from === 3 && d.to === 4)).toBe(true)
    // …and the sibling top-level paragraph's decoration survived, mapped by +1.
    expect(getDecorations(editor).some(d => d.from === 13)).toBe(true)

    editor.destroy()
  })

  it('warns when createInRange returns a decoration anchored outside the range', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const create = vi.fn(({ state }) => scan(state, 0, state.doc.content.size))
    // Buggy createInRange: always returns a decoration anchored at position 1,
    // regardless of the requested range — violating the incremental contract.
    const createInRange = vi.fn(() => [
      decoration.inline(1, 2, { class: 'oops' }, { source: 'oops' }),
    ])
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () => ({ update: 'changedRanges', create, createInRange }),
    })

    const editor = createEditor(extension, '<p>aaa</p><p>bbb</p>')

    // Edit the second paragraph so the changed range starts well past position 1.
    editor.commands.insertContentAt(8, 'x')

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('outside the requested range'))
    expect(getDecorations(editor).some(d => d.spec.source === 'oops')).toBe(false)

    warn.mockRestore()
    editor.destroy()
  })

  it('removes decorations from a deleted block during incremental recomputation', () => {
    const { extension } = incrementalExtension()
    const editor = createEditor(extension, '<p>x</p><p>x</p>')

    expect(getDecorations(editor).filter(d => d.spec.source === 'hit')).toHaveLength(2)

    editor.commands.deleteRange({ from: 4, to: 5 })

    expect(getDecorations(editor).filter(d => d.spec.source === 'hit')).toHaveLength(1)

    editor.destroy()
  })

  it('rebuilds every block touched by a multi-block replacement', () => {
    const { extension, create, createInRange } = incrementalExtension()
    const editor = createEditor(extension, '<p>aaa</p><p>bbb</p>')

    editor.commands.setContent('<p>xxx</p><p>xxx</p>')

    expect(create).toHaveBeenCalledTimes(1)
    expect(createInRange).toHaveBeenCalled()
    expect(getDecorations(editor).filter(d => d.spec.source === 'hit')).toHaveLength(6)

    editor.destroy()
  })

  it('rebuilds the affected block when a node attribute changes', () => {
    const AttributedParagraph = Paragraph.extend({
      addAttributes() {
        return {
          decorated: {
            default: false,
          },
        }
      },
    })
    const scan = (state: Editor['state'], from: number, to: number) => {
      const decorations: DecorationDescriptor[] = []

      state.doc.nodesBetween(from, to, (node, pos) => {
        if (node.type.name === 'paragraph' && node.attrs.decorated) {
          decorations.push(decoration.node(pos, pos + node.nodeSize, { class: 'decorated' }))
        }
      })

      return decorations
    }
    const create = vi.fn(({ state }) => scan(state, 0, state.doc.content.size))
    const createInRange = vi.fn(({ state, from, to }) => scan(state, from, to))
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () => ({ update: 'changedRanges', create, createInRange }),
    })
    const editor = new Editor({
      extensions: [Document, AttributedParagraph, Text, extension],
      content: '<p>hello</p><p>world</p>',
    })

    editor.view.dispatch(editor.state.tr.setNodeAttribute(0, 'decorated', true))

    expect(create).toHaveBeenCalledTimes(1)
    expect(createInRange).toHaveBeenCalledTimes(1)
    expect(getDecorations(editor)).toHaveLength(1)
    expect(getDecorations(editor)[0].from).toBe(0)

    editor.destroy()
  })

  it('falls back to a full rebuild when a document attribute changes', () => {
    const AttributedDocument = Document.extend({
      addAttributes() {
        return {
          revision: {
            default: 0,
          },
        }
      },
    })
    const build = (state: Editor['state']) => [
      decoration.node(
        0,
        state.doc.firstChild?.nodeSize ?? 0,
        {},
        { revision: state.doc.attrs.revision },
      ),
    ]
    const create = vi.fn(({ state }) => build(state))
    const createInRange = vi.fn(({ state }) => build(state))
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () => ({ update: 'changedRanges', create, createInRange }),
    })
    const editor = new Editor({
      extensions: [AttributedDocument, Paragraph, Text, extension],
      content: '<p>hello</p>',
    })

    editor.view.dispatch(editor.state.tr.setDocAttribute('revision', 1))

    expect(create).toHaveBeenCalledTimes(2)
    expect(createInRange).not.toHaveBeenCalled()
    expect(getDecorations(editor)[0].spec.revision).toBe(1)

    editor.destroy()
  })

  it('falls back to a full rebuild when a transaction mixes local and document changes', () => {
    const AttributedDocument = Document.extend({
      addAttributes() {
        return {
          revision: {
            default: 0,
          },
        }
      },
    })
    const create = vi.fn(({ state }) => [
      decoration.inline(1, 2, {}, { revision: state.doc.attrs.revision }),
    ])
    const createInRange = vi.fn(({ state, from, to }) => [
      decoration.inline(from, Math.min(from + 1, to), {}, { revision: state.doc.attrs.revision }),
    ])
    const extension = Extension.create({
      name: 'deco',
      addDecorations: () => ({ update: 'changedRanges', create, createInRange }),
    })
    const editor = new Editor({
      extensions: [AttributedDocument, Paragraph, Text, extension],
      content: '<p>hello</p>',
    })
    const transaction = editor.state.tr.insertText('!', 2).setDocAttribute('revision', 1)

    editor.view.dispatch(transaction)

    expect(create).toHaveBeenCalledTimes(2)
    expect(createInRange).not.toHaveBeenCalled()
    expect(getDecorations(editor)[0].spec.revision).toBe(1)

    editor.destroy()
  })
})
