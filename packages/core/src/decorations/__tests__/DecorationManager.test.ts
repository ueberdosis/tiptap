import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Decoration, DECORATION_MANAGER_PLUGIN_KEY, Editor, Extension } from '@tiptap/core'
import { describe, expect, it, vi } from 'vitest'

import * as mergeModule from '../helpers/mergeDecorationSets.js'
import * as replaceModule from '../helpers/replaceRecomputedDecorationSets.js'

import type { EditorState } from '@tiptap/pm/state'

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
