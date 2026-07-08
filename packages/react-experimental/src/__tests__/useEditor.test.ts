import type { Editor } from '@tiptap/core'
import { act, createElement, StrictMode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { EditorContent } from '../components/EditorContent.js'
import { useEditor } from '../useEditor.js'
import { mountTrackedRoot, tiptapTestNodes, unmountTrackedRoots } from './helpers.js'

afterEach(unmountTrackedRoots)

const flushDestructionTick = () =>
  act(async () => {
    await new Promise(resolve => {
      setTimeout(resolve, 5)
    })
  })

interface HarnessProps {
  options?: Parameters<typeof useEditor>[0]
  deps?: unknown[]
  onEditor: (editor: Editor | null) => void
}

const Harness = ({ options, deps, onEditor }: HarnessProps) => {
  const editor = useEditor({ extensions: tiptapTestNodes, content: '<p>hi</p>', ...options }, deps)

  onEditor(editor)
  return editor ? createElement(EditorContent, { editor }) : null
}

const renderHarness = async (props: Omit<HarnessProps, 'onEditor'> & { strict?: boolean } = {}) => {
  const { root, container } = mountTrackedRoot()
  const seen: (Editor | null)[] = []
  const render = (next: typeof props) => {
    const tree = createElement(Harness, {
      options: next.options,
      deps: next.deps,
      onEditor: editor => seen.push(editor),
    })

    return act(async () => {
      root.render(props.strict ? createElement(StrictMode, null, tree) : tree)
    })
  }

  await render(props)
  return {
    container,
    seen,
    get editor() {
      return seen[seen.length - 1]
    },
    rerender: render,
  }
}

describe('useEditor', () => {
  it('creates the editor immediately and renders the document', async () => {
    const harness = await renderHarness()

    expect(harness.editor?.state.doc.textContent).toBe('hi')
    expect(harness.container.querySelector('p')?.textContent).toBe('hi')
  })

  it('keeps a single live instance across a StrictMode double mount', async () => {
    const harness = await renderHarness({ strict: true })

    await flushDestructionTick()

    const instances = new Set(harness.seen.filter(Boolean))

    expect(instances.size).toBe(1)
    expect(harness.editor?.extensionManager).toBeTruthy()
  })

  it('returns null first with immediatelyRender: false, then an editor', async () => {
    const harness = await renderHarness({ options: { immediatelyRender: false } })

    expect(harness.seen[0]).toBeNull()
    expect(harness.editor).not.toBeNull()
    expect(harness.container.querySelector('p')?.textContent).toBe('hi')
  })

  it('recreates the instance when deps change and keeps it when they do not', async () => {
    const harness = await renderHarness({ deps: [1] })
    const first = harness.editor

    await harness.rerender({ deps: [1] })
    expect(harness.editor).toBe(first)

    await harness.rerender({ deps: [2] })
    expect(harness.editor).not.toBe(first)
    expect(first && !first.extensionManager).toBe(true)
  })

  it('syncs drifted options in place with empty deps', async () => {
    const harness = await renderHarness({
      options: { editorProps: { attributes: { role: 'textbox' } } },
    })
    const first = harness.editor

    await harness.rerender({ options: { editorProps: { attributes: { 'data-x': 'y' } } } })

    // Same instance, options applied via setOptions
    expect(harness.editor).toBe(first)
    expect(first?.options.editorProps?.attributes).toEqual({ 'data-x': 'y' })
  })

  it('re-renders the owner per transaction only with shouldRerenderOnTransaction', async () => {
    for (const shouldRerender of [false, true]) {
      const harness = await renderHarness({
        options: { shouldRerenderOnTransaction: shouldRerender },
      })
      const editor = harness.editor as Editor
      const rendersBefore = harness.seen.length

      await act(async () => {
        editor.view.dispatch(editor.state.tr.insertText('!', 1))
      })

      if (shouldRerender) {
        expect(harness.seen.length, 'rerenders enabled').toBeGreaterThan(rendersBefore)
      } else {
        expect(harness.seen.length, 'rerenders disabled').toBe(rendersBefore)
      }
      await unmountTrackedRoots()
    }
  })

  it('destroys the instance after a real unmount', async () => {
    const harness = await renderHarness()
    const editor = harness.editor as Editor

    await unmountTrackedRoots()
    await flushDestructionTick()

    expect(!editor.extensionManager).toBe(true)
  })
})
