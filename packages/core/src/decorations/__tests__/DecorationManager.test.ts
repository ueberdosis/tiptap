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

  it('multi-extension: merged set keeps non-recomputed extension decorations', () => {
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

    editor.commands.setTextSelection({ from: 1, to: 4 })
    editor.commands.insertContent('X')

    const after = getState(editor)!
    const mergedDecos = after.mergedDecorationSet.find()
    const byExtension = (name: string) =>
      mergedDecos.filter(d => (d.spec as { extensionName?: string }).extensionName === name)

    // The merged set is rebuilt from the per-extension sets, so the mapped
    // manual decorations must survive alongside the recomputed ones.
    expect(byExtension('manual').length).toBe(
      after.decorationSetsByExtension['manual'].find().length,
    )
    expect(byExtension('hl').length).toBe(after.decorationSetsByExtension['hl'].find().length)
    expect(mergedDecos.length).toBe(byExtension('manual').length + byExtension('hl').length)

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
  it('recomputes create() for attr-only appendTransaction', () => {
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
    // attr-only transaction. Both can change values read by create().
    editor.commands.insertContentAt(6, '!')
    expect(createCalls.length).toBe(3)

    editor.destroy()
  })

  it('does not warn for a copied widget key repaired by an appended transaction', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const idAttribute = Extension.create({
      name: 'idAttribute',
      addGlobalAttributes: () => [{ types: ['paragraph'], attributes: { id: { default: null } } }],
    })
    const widgetExtension = Extension.create({
      name: 'widgets',
      addDecorations: () => ({
        create: ({ state }) => {
          const decorations: Decoration[] = []

          state.doc.forEach((node, pos) => {
            if (node.type.name === 'paragraph') {
              decorations.push(
                Decoration.Widget(pos + node.nodeSize - 1, () => document.createElement('span'), {
                  key: `paragraph-${node.attrs.id}`,
                }),
              )
            }
          })

          return decorations
        },
      }),
    })
    const repairIds = Extension.create({
      name: 'repairIds',
      addProseMirrorPlugins: () => [
        new Plugin({
          key: new PluginKey('repairIds'),
          appendTransaction: (transactions, _oldState, newState) => {
            if (!transactions.some(transaction => transaction.docChanged)) {
              return
            }

            const ids = new Set<string>()
            const tr = newState.tr

            newState.doc.forEach((node, pos) => {
              const id = node.attrs.id

              if (node.type.name === 'paragraph' && id && ids.has(id)) {
                tr.setNodeAttribute(pos, 'id', `${id}-copy`)
              }

              ids.add(id)
            })

            return tr.steps.length ? tr : undefined
          },
        }),
      ],
    })
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, idAttribute, widgetExtension, repairIds],
      content: {
        type: 'doc',
        content: [
          { type: 'paragraph', attrs: { id: 'first' }, content: [{ type: 'text', text: 'a' }] },
          { type: 'paragraph', attrs: { id: 'second' }, content: [{ type: 'text', text: 'b' }] },
        ],
      },
    })

    warn.mockClear()
    editor.chain().setTextSelection(2).splitBlock().run()

    expect(getState(editor)!.widgetKeys.size).toBe(3)
    expect(warn).not.toHaveBeenCalled()

    warn.mockRestore()
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
      expect.stringContaining('`editor.state` was read while decoration `create()` was running'),
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

describe('DecorationManager boundary decorations', () => {
  type BlockScan = (state: EditorState, from: number, to: number) => Decoration[]

  /** Builds a changedRanges extension that runs `scan` over the whole doc or one range. */
  function scanExtension(name: string, scan: BlockScan) {
    return Extension.create({
      name,
      addDecorations: () => ({
        update: 'changedRanges' as const,
        create: ({ state }: { state: EditorState }) => scan(state, 0, state.doc.content.size),
        createInRange: ({ state, from, to }: { state: EditorState; from: number; to: number }) =>
          scan(state, from, to),
      }),
    })
  }

  /** changedRanges extension that places a widget at each inner block boundary. */
  function boundaryWidgetExtension(name: string) {
    return scanExtension(name, (state, from, to) => {
      const decorations: Decoration[] = []

      state.doc.forEach((node, pos, index) => {
        const blockEnd = pos + node.nodeSize

        // Only inner boundaries (not end of doc), where the leak shows.
        if (blockEnd < state.doc.content.size && blockEnd >= from && blockEnd <= to) {
          decorations.push(
            Decoration.Widget(blockEnd, () => document.createElement('span'), {
              key: `boundary-widget-${index}`,
            }),
          )
        }
      })

      return decorations
    })
  }

  /** changedRanges extension that places a node decoration on each top-level block. */
  function nodeDecorationExtension(name: string) {
    return scanExtension(name, (state, from, to) => {
      const decorations: Decoration[] = []

      state.doc.forEach((node, pos) => {
        const blockEnd = pos + node.nodeSize

        if (pos >= from && blockEnd <= to) {
          decorations.push(Decoration.Node(pos, blockEnd, { class: 'node-deco' }))
        }
      })

      return decorations
    })
  }

  /** changedRanges extension with an inline decoration anchored at each inner block end. */
  function spanningBoundaryExtension(name: string) {
    return scanExtension(name, (state, from, to) => {
      const decorations: Decoration[] = []

      state.doc.forEach((node, pos) => {
        const blockEnd = pos + node.nodeSize

        if (blockEnd < state.doc.content.size && blockEnd >= from && blockEnd <= to) {
          decorations.push(Decoration.Inline(blockEnd, blockEnd + 1, { class: 'boundary' }))
        }
      })

      return decorations
    })
  }

  /** changedRanges extension that places a widget at the start of every top-level block. */
  function blockStartWidgetExtension(name: string) {
    return scanExtension(name, (state, from, to) => {
      const decorations: Decoration[] = []

      state.doc.forEach((node, pos, index) => {
        if (pos >= from && pos < to) {
          decorations.push(
            Decoration.Widget(pos, () => document.createElement('span'), {
              key: `block-start-widget-${index}`,
            }),
          )
        }
      })

      return decorations
    })
  }

  it('keeps a widget at the start of the next block when editing the previous block', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, blockStartWidgetExtension('blockStartWidget')],
      content: '<p>foo</p><p>bar</p><p>baz</p>',
    })

    const widgetPositions = () =>
      getState(editor)!
        .mergedDecorationSet.find()
        .map(decoration => decoration.from)

    expect(widgetPositions()).toEqual([0, 5, 10])

    editor.commands.insertContentAt(1, 'X')

    // The rebuild range for the first block is [0, 5], and 5 is also the second
    // block's start. The stale sweep drops the widget there, but createInRange
    // only runs for the first block, so nothing recreates it.
    expect(widgetPositions()).toEqual([0, 6, 11])
    expect(getState(editor)!.widgetKeys.size).toBe(3)

    editor.destroy()
  })

  it('does not leak widget decorations at inner block boundaries across keystrokes', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, boundaryWidgetExtension('boundaryWidget')],
      content: '<p>foo</p><p>bar</p>',
    })

    // One widget: at the end of p1 (the inner boundary), none at end of p2 (end of doc).
    expect(getState(editor)!.mergedDecorationSet.find().length).toBe(1)

    // Type 5 times in the first paragraph — only p1's block is rebuilt each time.
    for (let i = 0; i < 5; i++) {
      editor.commands.insertContentAt(1, 'X')
    }

    const after = getState(editor)!

    // Without the fix, each keystroke adds a duplicate widget (1 + 5 = 6).
    expect(after.mergedDecorationSet.find().length).toBe(1)
    expect(after.widgetKeys.size).toBe(1)

    editor.destroy()
  })

  it('preserves node decorations on the next block when editing the previous block', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, nodeDecorationExtension('nodeDeco')],
      content: '<p>foo</p><p>bar</p>',
    })

    // Two node decorations: one per paragraph.
    expect(getState(editor)!.mergedDecorationSet.find().length).toBe(2)

    // Type in the first paragraph — only p1's block is rebuilt.
    editor.commands.insertContentAt(1, 'X')

    const after = getState(editor)!

    // Both node decorations should survive: p1 rebuilt, p2 preserved.
    // With the from <= to bug, p2's decoration was removed and not recreated.
    expect(after.mergedDecorationSet.find().length).toBe(2)

    editor.destroy()
  })

  it('does not duplicate spanning decorations anchored at a block end across keystrokes', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, spanningBoundaryExtension('spanningBoundary')],
      content: '<p>foo</p><p>bar</p>',
    })

    // One decoration, anchored at the end of p1 and reaching into p2.
    expect(getState(editor)!.mergedDecorationSet.find().length).toBe(1)

    // Type 5 times in the first paragraph, so only p1's block is rebuilt.
    for (let index = 0; index < 5; index += 1) {
      editor.commands.insertContentAt(1, 'X')
    }

    const after = getState(editor)!

    // Without the fix it was re-added on every keystroke (1 + 5 = 6).
    expect(after.mergedDecorationSet.find().length).toBe(1)

    editor.destroy()
  })
})

describe('DecorationManager remounts', () => {
  /** Number of `beforeTransaction` listeners currently registered on the editor. */
  function beforeTransactionListeners(editor: Editor) {
    const callbacks = (editor as unknown as { callbacks: Record<string, unknown[]> }).callbacks

    return callbacks.beforeTransaction?.length ?? 0
  }

  function duplicateKeyExtension() {
    return Extension.create({
      name: 'duplicateWidgets',
      addDecorations() {
        return {
          create: () => [
            Decoration.Widget(1, () => document.createElement('span'), { key: 'dup' }),
            Decoration.Widget(1, () => document.createElement('span'), { key: 'dup' }),
          ],
        }
      },
    })
  }

  it('replaces the decoration manager instead of stacking listeners', () => {
    const element = document.createElement('div')
    const editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, duplicateKeyExtension()],
      content: '<p>hello</p>',
    })

    expect(beforeTransactionListeners(editor)).toBe(1)

    const firstManager = editor.extensionManager.decorationManager

    editor.unmount()
    editor.mount(element)
    editor.unmount()
    editor.mount(element)

    expect(beforeTransactionListeners(editor)).toBe(1)
    expect(editor.extensionManager.decorationManager).not.toBe(firstManager)

    editor.destroy()
  })

  it('does not warn from orphaned managers after remounting', () => {
    const element = document.createElement('div')
    const editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, duplicateKeyExtension()],
      content: '<p>hello</p>',
    })

    editor.unmount()
    editor.mount(element)
    editor.unmount()
    editor.mount(element)

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    editor.commands.insertContentAt(1, '!')

    const duplicateWarnings = warn.mock.calls.filter(call =>
      String(call[0]).includes('Duplicate widget decoration key "dup"'),
    )

    warn.mockRestore()

    // Only the live manager warns. Each orphaned manager used to add one more
    // warning per transaction, so this grew with every remount.
    expect(duplicateWarnings).toHaveLength(1)

    editor.destroy()
  })
})
