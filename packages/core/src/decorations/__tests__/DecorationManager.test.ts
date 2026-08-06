import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import {
  Decoration,
  DECORATION_MANAGER_PLUGIN_KEY,
  Editor,
  Extension,
  liveWidgetKeys,
} from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorState } from '@tiptap/pm/state'
import { describe, expect, it, vi } from 'vitest'

import * as mergeModule from '../helpers/mergeDecorationSets.js'
import * as replaceModule from '../helpers/replaceRecomputedDecorationSets.js'

/** changedRanges extension that highlights `term` with inline decorations. */
function highlightExtension(name: string, term: string) {
  return Extension.create({
    name,
    addStorage() {
      return { term }
    },
    addDecorations() {
      const scan = (editor: Editor, state: EditorState, from: number, to: number) => {
        const decorations: Decoration[] = []
        const t = (editor.storage as unknown as Record<string, { term: string }>)[
          name
        ].term.toLowerCase()

        if (!t) {
          return decorations
        }

        state.doc.nodesBetween(from, to, (node, pos) => {
          if (!node.isText || !node.text) {
            return
          }

          const text = node.text.toLowerCase()
          let index = text.indexOf(t)

          while (index !== -1) {
            decorations.push(
              Decoration.Inline(pos + index, pos + index + t.length, { class: 'hl' }),
            )
            index = text.indexOf(t, index + t.length)
          }
        })

        return decorations
      }

      return {
        update: 'changedRanges' as const,
        create: ({ editor, state }: { editor: Editor; state: EditorState }) =>
          scan(editor, state, 0, state.doc.content.size),
        createInRange: ({
          editor,
          state,
          from,
          to,
        }: {
          editor: Editor
          state: EditorState
          from: number
          to: number
        }) => scan(editor, state, from, to),
      }
    },
  })
}

/** manual extension that adds a node decoration per top-level block. */
function manualExtension(name: string) {
  return Extension.create({
    name,
    addDecorations() {
      return {
        update: 'manual' as const,
        create: ({ state }: { state: EditorState }) => {
          const decorations: Decoration[] = []

          state.doc.forEach((node, pos) => {
            decorations.push(Decoration.Node(pos, pos + node.nodeSize, { class: 'manual-node' }))
          })

          return decorations
        },
      }
    },
  })
}

function getState(editor: Editor) {
  return DECORATION_MANAGER_PLUGIN_KEY.getState(editor.state)
}

describe('DecorationManager incremental merge', () => {
  it('single-extension fast path: merged set is the extension set, mergeDecorationSets not called', () => {
    const mergeSpy = vi.spyOn(mergeModule, 'mergeDecorationSets')

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, highlightExtension('hl', 'foo')],
      content: '<p>foo bar foo</p>',
    })

    const state = getState(editor)!

    expect(mergeSpy).not.toHaveBeenCalled()
    expect(state.mergedDecorationSet).toBe(state.decorationSetsByExtension['hl'])

    mergeSpy.mockRestore()
    editor.destroy()
  })

  it('changed-range edit does not call mergeDecorationSets for single extension', () => {
    const mergeSpy = vi.spyOn(mergeModule, 'mergeDecorationSets')

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, highlightExtension('hl', 'foo')],
      content: '<p>foo bar</p><p>foo baz</p>',
    })

    mergeSpy.mockClear()

    editor.commands.setTextSelection({ from: 13, to: 16 })
    editor.commands.insertContent('X')

    expect(mergeSpy).not.toHaveBeenCalled()

    mergeSpy.mockRestore()
    editor.destroy()
  })

  it('unchanged manual extension decorations are mapped, not rebuilt', () => {
    const createCalls: number[] = []

    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Extension.create({
          name: 'manual',
          addDecorations() {
            return {
              update: 'manual' as const,
              create: ({ state }: { state: EditorState }) => {
                createCalls.push(state.doc.content.size)
                const decorations: Decoration[] = []

                state.doc.forEach((node, pos) => {
                  decorations.push(
                    Decoration.Node(pos, pos + node.nodeSize, { class: 'manual-node' }),
                  )
                })

                return decorations
              },
            }
          },
        }),
        highlightExtension('hl', 'foo'),
      ],
      content: '<p>foo bar</p><p>foo baz</p>',
    })

    expect(createCalls.length).toBe(1)

    editor.commands.setTextSelection({ from: 1, to: 4 })
    editor.commands.insertContent('X')

    // manual's create should NOT be called again — mapped, not rebuilt.
    expect(createCalls.length).toBe(1)

    const after = getState(editor)!
    const manualDecos = after.decorationSetsByExtension['manual'].find()
    expect(manualDecos.length).toBe(2)

    editor.destroy()
  })

  it('multi-extension: only recomputed extension decorations are replaced in merged set', () => {
    const replaceSpy = vi.spyOn(replaceModule, 'replaceRecomputedDecorationSets')
    const mergeSpy = vi.spyOn(mergeModule, 'mergeDecorationSets')

    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        manualExtension('manual'),
        highlightExtension('hl', 'foo'),
      ],
      content: '<p>foo bar</p><p>foo baz</p>',
    })

    mergeSpy.mockClear()
    replaceSpy.mockClear()

    editor.commands.setTextSelection({ from: 1, to: 4 })
    editor.commands.insertContent('X')

    // init used mergeDecorationSets (multi-extension), but apply should not.
    expect(mergeSpy).not.toHaveBeenCalled()
    expect(replaceSpy).toHaveBeenCalledTimes(1)

    const after = getState(editor)!
    const mergedDecos = after.mergedDecorationSet.find()
    const manualInMerged = mergedDecos.filter(
      d => (d.spec as { extensionName?: string }).extensionName === 'manual',
    )
    expect(manualInMerged.length).toBeGreaterThan(0)

    replaceSpy.mockRestore()
    mergeSpy.mockRestore()
    editor.destroy()
  })

  it('force recompute of single extension uses fast path (no merge)', () => {
    const mergeSpy = vi.spyOn(mergeModule, 'mergeDecorationSets')

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, highlightExtension('hl', 'foo')],
      content: '<p>foo bar</p>',
    })

    mergeSpy.mockClear()

    ;(editor.storage as unknown as Record<string, { term: string }>).hl.term = 'bar'
    editor.commands.updateDecorations('hl')

    expect(mergeSpy).not.toHaveBeenCalled()

    const state = getState(editor)!
    expect(state.mergedDecorationSet).toBe(state.decorationSetsByExtension['hl'])

    mergeSpy.mockRestore()
    editor.destroy()
  })
})

describe('DecorationManager view prop', () => {
  /** Records the `view` each create call receives. */
  function viewProbeExtension(views: unknown[]) {
    return Extension.create({
      name: 'viewProbe',
      addDecorations() {
        return {
          create: ({ view, state }: { view: unknown; state: EditorState }) => {
            views.push(view)

            return [Decoration.Inline(1, state.doc.content.size, { class: 'probe' })]
          },
        }
      },
    })
  }

  it('passes the mounted view while the editor has a view', () => {
    const views: unknown[] = []

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, viewProbeExtension(views)],
      content: '<p>hello</p>',
    })

    expect(views).toHaveLength(1)
    expect(views[0]).toBe(editor.view)
    expect((views[0] as { dom: HTMLElement }).dom).toBeTruthy()

    editor.destroy()
  })

  it('passes null instead of the placeholder view after unmount', () => {
    const views: unknown[] = []

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, viewProbeExtension(views)],
      content: '<p>hello</p>',
    })

    // Read the state while mounted so the unmounted editor keeps the plugin state.
    expect(getState(editor)).toBeTruthy()
    editor.unmount()

    expect(() => editor.view.dispatch(editor.state.tr.insertText('!', 1))).not.toThrow()
    expect(views).toHaveLength(2)
    expect(views[1]).toBeNull()

    editor.destroy()
  })
})

describe('liveWidgetKeys lifecycle', () => {
  function widgetExtension() {
    return Extension.create({
      name: 'widgetDeco',
      addDecorations() {
        return {
          create: ({ state }: { state: EditorState }) => [
            Decoration.Widget(state.doc.content.size, () => document.createElement('span'), {
              key: 'w-end',
            }),
          ],
        }
      },
    })
  }

  it('returns an empty set after destroy instead of throwing', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, widgetExtension()],
      content: '<p>hello</p>',
    })

    editor.destroy()

    expect(() => liveWidgetKeys(editor)).not.toThrow()
    expect(liveWidgetKeys(editor).size).toBe(0)
  })

  it('keeps widget keys after unmount without a prior state read', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, widgetExtension()],
      content: '<p>hello</p>',
    })

    editor.unmount()

    expect(liveWidgetKeys(editor).has('w-end')).toBe(true)

    editor.destroy()
  })
})

describe('DecorationManager attr-only transactions', () => {
  it('skips create() recompute for attr-only appendTransaction', () => {
    const createCalls: number[] = []
    const decoExtension = Extension.create({
      name: 'decoProbe',
      addDecorations() {
        return {
          create: ({ state }: { state: EditorState }) => {
            createCalls.push(state.doc.content.size)

            return [Decoration.Node(0, state.doc.content.size, { class: 'probe' })]
          },
        }
      },
    })

    // Simulates UniqueID: appends a transaction that only sets a node attr.
    const attrAppendExtension = Extension.create({
      name: 'attrAppend',
      addProseMirrorPlugins() {
        return [
          new Plugin({
            key: new PluginKey('attrAppend'),
            appendTransaction: (_trs: unknown[], _oldState: EditorState, newState: EditorState) => {
              const tr = newState.tr
              const firstChild = newState.doc.firstChild

              if (!firstChild) {
                return
              }

              tr.setNodeAttribute(0, 'data-probe', 'x')

              return tr
            },
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, decoExtension, attrAppendExtension],
      content: '<p>hello</p>',
    })

    // init calls create() once
    expect(createCalls.length).toBe(1)

    // A text edit triggers the root transaction, then attrAppend appends an
    // attr-only transaction. create() should run for the root (positions
    // changed) but NOT for the appended attr-only transaction.
    editor.commands.insertContentAt(6, '!')
    expect(createCalls.length).toBe(2)

    editor.destroy()
  })

  it('still recomputes for mark changes', () => {
    const createCalls: number[] = []
    const decoExtension = Extension.create({
      name: 'decoProbe',
      addDecorations() {
        return {
          create: ({ state }: { state: EditorState }) => {
            createCalls.push(state.doc.content.size)

            return [Decoration.Inline(1, state.doc.content.size, { class: 'probe' })]
          },
        }
      },
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Bold, decoExtension],
      content: '<p>hello</p>',
    })

    expect(createCalls.length).toBe(1)

    // Selection-only change doesn't trigger recompute (no docChanged).
    editor.chain().setTextSelection({ from: 1, to: 4 }).run()
    expect(createCalls.length).toBe(1)

    // toggleMark adds an AddMarkStep — should trigger recompute.
    editor.chain().toggleMark('bold').run()
    expect(createCalls.length).toBe(2)

    editor.destroy()
  })
})

describe('DecorationManager editor.state staleness warning', () => {
  it('warns when editor.state is read inside create()', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const decoExtension = Extension.create({
      name: 'stateProbe',
      addDecorations() {
        return {
          create: ({ editor, state }: { editor: Editor; state: EditorState }) => {
            // Reading editor.state inside create() — should warn during apply.
            void editor.state

            return [Decoration.Node(0, state.doc.content.size, { class: 'probe' })]
          },
        }
      },
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, decoExtension],
      content: '<p>hello</p>',
    })

    // init doesn't warn — editor.state is not stale during init (no view yet).
    warn.mockClear()

    // A text edit triggers apply → create() → editor.state read → warn.
    editor.commands.insertContentAt(6, '!')

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('editor.state` was read inside decoration `create()'),
    )

    warn.mockRestore()
    editor.destroy()
  })

  it('does not warn when only the state argument is used', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const decoExtension = Extension.create({
      name: 'stateProbe',
      addDecorations() {
        return {
          create: ({ state }: { state: EditorState }) => {
            // Using the state argument — no warning.
            return [Decoration.Node(0, state.doc.content.size, { class: 'probe' })]
          },
        }
      },
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, decoExtension],
      content: '<p>hello</p>',
    })

    warn.mockClear()
    editor.commands.insertContentAt(6, '!')

    expect(warn).not.toHaveBeenCalled()

    warn.mockRestore()
    editor.destroy()
  })
})
