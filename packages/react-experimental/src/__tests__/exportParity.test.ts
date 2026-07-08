import * as core from '@tiptap/core'
import { describe, expect, it } from 'vitest'

import * as pkg from '../index.js'
import * as menus from '../menus/index.js'

/**
 * Local exports intentionally shadowing a core name of the same spelling.
 * Keep this list conscious and short: any new collision must either be
 * renamed (Renderer*) or added here deliberately.
 */
const INTENTIONAL_SHADOWS: string[] = []

describe('drop-in export surface', () => {
  it('exports the legacy @tiptap/react core API', () => {
    // Hooks
    expect(pkg.useEditor).toBeTypeOf('function')
    expect(pkg.useEditorState).toBeTypeOf('function')
    expect(pkg.useCurrentEditor).toBeTypeOf('function')

    // Provider pattern
    expect(pkg.Tiptap).toBeTypeOf('function')
    expect(pkg.Tiptap.Content).toBeTypeOf('function')
    expect(pkg.TiptapWrapper).toBe(pkg.Tiptap)
    expect(pkg.TiptapContent).toBe(pkg.Tiptap.Content)
    expect(pkg.TiptapContext).toBeTruthy()
    expect(pkg.useTiptap).toBeTypeOf('function')
    expect(pkg.useTiptapState).toBeTypeOf('function')

    // Content + node/mark view kit
    expect(pkg.EditorContent).toBeTypeOf('function')
    expect(pkg.NodeViewWrapper).toBeTruthy()
    expect(pkg.NodeViewContent).toBeTypeOf('function')
    expect(pkg.useReactNodeView).toBeTypeOf('function')
    expect(pkg.ReactNodeViewRenderer).toBeTypeOf('function')
    expect(pkg.ReactMarkViewRenderer).toBeTypeOf('function')
    expect(pkg.MarkViewContent).toBeTypeOf('function')
    expect(pkg.ReactMarkViewContext).toBeTruthy()
  })

  it('exports the menus subpath', () => {
    expect(menus.BubbleMenu).toBeTruthy()
    expect(menus.FloatingMenu).toBeTruthy()
  })

  it('re-exports @tiptap/core with core winning every shared name', () => {
    // Spot checks: the standard imports apps take from @tiptap/react
    expect(pkg.Editor).toBe(core.Editor)
    expect(pkg.Node).toBe(core.Node)
    expect(pkg.Mark).toBe(core.Mark)
    expect(pkg.Extension).toBe(core.Extension)
    expect(pkg.mergeAttributes).toBe(core.mergeAttributes)
    expect(pkg.getExtensionField).toBe(core.getExtensionField)

    // NodeView/MarkView are core's classes, not this package's components
    expect(pkg.NodeView).toBe(core.NodeView)
    expect(pkg.MarkView).toBe(core.MarkView)
    expect(pkg.RendererNodeView).not.toBe(core.NodeView)
    expect(pkg.RendererMarkView).not.toBe(core.MarkView)

    // Exhaustive: no unintentional shadowing of any core runtime export
    const shadowed = Object.keys(core).filter(
      name =>
        name in pkg &&
        (pkg as Record<string, unknown>)[name] !== (core as Record<string, unknown>)[name],
    )

    expect(shadowed.sort()).toEqual(INTENTIONAL_SHADOWS.sort())
  })
})
