import { Extension, posToDOMRect } from '@tiptap/core'
import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu'
import { FloatingMenuPlugin } from '@tiptap/extension-floating-menu'
import { history, redo, undo } from '@tiptap/pm/history'
import { TextSelection } from '@tiptap/pm/state'
import { act } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { renderTiptapEditor, unmountTrackedRoots } from './helpers.js'

afterEach(unmountTrackedRoots)

const HistoryExtension = Extension.create({
  name: 'testHistory',
  addProseMirrorPlugins: () => [history()],
})

/**
 * Phase 7 hardening: the Stop Criteria rows that are not already pinned down
 * by the per-feature suites, plus the runbook's smoke tests. Geometry values
 * are zeros under happy-dom (no layout); these tests assert the code paths
 * the extensions rely on run and return the right shapes — real coordinates
 * are covered by the Playwright specs.
 */
describe('stop criteria smoke tests', () => {
  it('supports the geometry APIs on the basic schema', async () => {
    const { editor, view, dom } = await renderTiptapEditor('<p>hello</p><p>world</p>')

    // coordsAtPos at start, middle, and end boundaries
    for (const pos of [1, 3, 6, 8, 12]) {
      const coords = view.coordsAtPos(pos)

      expect(coords).toMatchObject({
        left: expect.any(Number),
        right: expect.any(Number),
        top: expect.any(Number),
        bottom: expect.any(Number),
      })
    }

    // posAtCoords must not throw; happy-dom's zero-layout may or may not
    // resolve a position
    const result = view.posAtCoords({ left: 0, top: 0 })

    expect(result === null || typeof result.pos === 'number').toBe(true)

    // posToDOMRect is what BubbleMenu/FloatingMenu position from
    const rect = posToDOMRect(view, 1, 6)

    expect(rect).toMatchObject({ width: expect.any(Number), height: expect.any(Number) })

    // The drag-handle path: element -> position -> element round-trip
    const paragraph = dom.children[1]

    expect(view.posAtDOM(paragraph, 0, -1)).toBe(8)
    expect(view.nodeDOM(7)).toBe(paragraph)

    editor.destroy()
  })

  /**
   * Registers a menu plugin, moves the selection to trigger its update path
   * (posToDOMRect, floating-ui), and waits for computePosition's async
   * resolution. Must not throw; the element must get mounted.
   */
  const settleMenuPlugin = async (
    editor: Awaited<ReturnType<typeof renderTiptapEditor>>['editor'],
    selection: number | { from: number; to: number },
  ) => {
    await act(async () => {
      editor.commands.setTextSelection(selection)
    })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20)) // oxlint-disable-line
    })
  }

  it('runs the BubbleMenu plugin view against the renderer', async () => {
    const { editor, container } = await renderTiptapEditor('<p>hello world</p>')
    const menuElement = document.createElement('div')

    editor.registerPlugin(
      BubbleMenuPlugin({
        editor,
        element: menuElement,
        pluginKey: 'testBubbleMenu',
        shouldShow: () => true,
        updateDelay: 0,
        resizeDelay: 0,
      }),
    )

    await settleMenuPlugin(editor, { from: 2, to: 7 })
    expect(container.contains(menuElement)).toBe(true)

    editor.destroy()
  })

  it('runs the FloatingMenu plugin view against the renderer', async () => {
    const { editor, container } = await renderTiptapEditor('<p></p>')
    const menuElement = document.createElement('div')

    editor.registerPlugin(
      FloatingMenuPlugin({
        editor,
        element: menuElement,
        pluginKey: 'testFloatingMenu',
        shouldShow: () => true,
      }),
    )

    await settleMenuPlugin(editor, 1)
    expect(container.contains(menuElement)).toBe(true)

    editor.destroy()
  })

  it('keeps host element identity through undo and redo', async () => {
    const { editor, view, dom } = await renderTiptapEditor('<p>one</p><p>two</p>', [
      HistoryExtension,
    ])

    const [first, second] = Array.from(dom.querySelectorAll('p'))

    await act(async () => {
      editor.commands.setTextSelection(4)
      editor.commands.insertContent('X')
    })
    expect(first.textContent).toBe('oneX')

    await act(async () => {
      undo(view.state, view.dispatch)
    })
    expect(first.textContent).toBe('one')

    await act(async () => {
      redo(view.state, view.dispatch)
    })
    expect(first.textContent).toBe('oneX')

    // The identity matrix: undo/redo update in place, no remount
    const [firstAfter, secondAfter] = Array.from(dom.querySelectorAll('p'))

    expect(firstAfter).toBe(first)
    expect(secondAfter).toBe(second)

    // Selection restored around the undone/redone change
    expect(view.state.selection.from).toBe(5)

    editor.destroy()
  })

  it('serializes the clipboard from the schema, not the live DOM', async () => {
    const { editor, view } = await renderTiptapEditor('<p>copy me</p>')

    // The recorded copy/paste architecture decision: ProseMirror's clipboard
    // pipeline is schema-based (DOMSerializer into a detached document), so
    // it works unchanged with React-owned DOM
    const selection = TextSelection.create(view.state.doc, 1, 8)
    const { dom, text } = view.serializeForClipboard(selection.content())

    expect(dom.innerHTML).toContain('copy me')
    expect(text).toBe('copy me')

    // Paste goes through the schema parser (the e2e spec covers the full
    // browser event pipeline)
    await act(async () => {
      editor.commands.setTextSelection(8)
      editor.commands.insertContent('<p> pasted</p>')
    })
    expect(editor.state.doc.textContent).toBe('copy me pasted')

    editor.destroy()
  })
})
