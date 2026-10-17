import {
  DECORATION_MANAGER_PLUGIN_KEY,
  Decoration,
  Editor,
  Extension,
  liveWidgetKeys,
  Node,
} from '@tiptap/core'
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

describe('changedRanges updates', () => {
  // Decorates every paragraph as a node decoration and highlights each
  // occurrence of "x" as an inline decoration, scanning only [from, to].
  function scan(state: Editor['state'], from: number, to: number) {
    const decorations: Decoration[] = []

    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type.name === 'paragraph') {
        decorations.push(
          Decoration.Node(pos, pos + node.nodeSize, { class: 'para' }, { source: 'paragraph' }),
        )
      }

      if (node.isText && node.text) {
        let index = node.text.indexOf('x')

        while (index !== -1) {
          decorations.push(
            Decoration.Inline(pos + index, pos + index + 1, { class: 'hit' }, { source: 'hit' }),
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
      Decoration.Inline(1, 2, { class: 'oops' }, { source: 'oops' }),
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

  it('warns once per editor, not once per process, for out-of-range decorations', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const outOfRange = () => ({
      update: 'changedRanges' as const,
      create: () => [],
      createInRange: () => [Decoration.Inline(1, 2, { class: 'oops' })],
    })
    const extension = Extension.create({ name: 'deco', addDecorations: outOfRange })
    const countWarnings = () =>
      warn.mock.calls.filter(([message]) => String(message).includes('outside the requested range'))
        .length

    const first = createEditor(extension, '<p>aaa</p><p>bbb</p>')

    first.commands.insertContentAt(8, 'x')
    // Same extension name, so a module-level dedupe set would silence this.
    first.commands.insertContentAt(9, 'y')
    expect(countWarnings()).toBe(1)
    first.destroy()

    const second = createEditor(extension, '<p>aaa</p><p>bbb</p>')

    second.commands.insertContentAt(8, 'x')
    expect(countWarnings()).toBe(2)
    second.destroy()

    warn.mockRestore()
  })

  it('drops decorations and logs when create throws instead of breaking the update', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const extension = Extension.create({
      name: 'throwing',
      addDecorations: () => ({
        create: () => {
          throw new Error('boom')
        },
      }),
    })

    const editor = createEditor(extension, '<p>aaa</p>')

    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('threw in `addDecorations().create()`'),
      expect.any(Error),
    )
    expect(getDecorations(editor)).toHaveLength(0)

    // The transaction still applies, so the document stays editable.
    editor.commands.insertContentAt(1, 'x')
    expect(editor.state.doc.textContent).toBe('xaaa')

    error.mockRestore()
    editor.destroy()
  })

  it('drops decorations and logs when createInRange throws', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const extension = Extension.create({
      name: 'throwing',
      addDecorations: () => ({
        update: 'changedRanges' as const,
        create: ({ state }) => [Decoration.Node(0, state.doc.firstChild?.nodeSize ?? 0)],
        createInRange: () => {
          throw new Error('boom')
        },
      }),
    })

    const editor = createEditor(extension, '<p>aaa</p>')

    expect(getDecorations(editor)).toHaveLength(1)

    editor.commands.insertContentAt(1, 'x')

    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('threw in `addDecorations().createInRange()`'),
      expect.any(Error),
    )
    expect(editor.state.doc.textContent).toBe('xaaa')
    expect(getDecorations(editor)).toHaveLength(0)

    error.mockRestore()
    editor.destroy()
  })

  it('keeps a widget placed at the end of the document (anchor === to)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // <p>aaa</p> -> doc.content.size === 5. The only top-level block range
    // is [0, 5]. A widget at pos 5 (end of document) has anchor === to.
    const endWidget = () => document.createElement('span')
    const create = vi.fn(({ state }) => [
      Decoration.Widget(state.doc.content.size, endWidget, { key: 'end-widget' }),
    ])
    const createInRange = vi.fn(({ state }) => [
      Decoration.Widget(state.doc.content.size, endWidget, { key: 'end-widget' }),
    ])
    const extension = Extension.create({
      name: 'endWidget',
      addDecorations: () => ({ update: 'changedRanges', create, createInRange }),
    })

    const editor = createEditor(extension, '<p>aaa</p>')

    // Edit inside the only block so createInRange runs with range [0, 5].
    editor.commands.insertContentAt(1, 'x')

    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('outside the requested range'))
    expect(warn).not.toHaveBeenCalledWith(
      expect.stringContaining('Duplicate widget decoration key'),
    )
    expect(liveWidgetKeys(editor).has('end-widget')).toBe(true)

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
      const decorations: Decoration[] = []

      state.doc.nodesBetween(from, to, (node, pos) => {
        if (node.type.name === 'paragraph' && node.attrs.decorated) {
          decorations.push(Decoration.Node(pos, pos + node.nodeSize, { class: 'decorated' }))
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
      Decoration.Node(
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
      Decoration.Inline(1, 2, {}, { revision: state.doc.attrs.revision }),
    ])
    const createInRange = vi.fn(({ state, from, to }) => [
      Decoration.Inline(from, Math.min(from + 1, to), {}, { revision: state.doc.attrs.revision }),
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
