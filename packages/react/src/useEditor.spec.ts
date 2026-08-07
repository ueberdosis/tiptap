import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { render } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import type { Editor } from '@tiptap/core'
import { useEditor } from './useEditor.js'

function flushTimers(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms)
  })
}

describe('useEditor', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('does not fire onCreate more than once for a single mount under StrictMode', async () => {
    // onBeforeCreate legitimately still fires for both the kept and the
    // discarded StrictMode-duplicate instance (it fires synchronously as
    // part of construction itself, before there's any way to know which one
    // survives). onCreate is what's actually fixed here: it's deferred until
    // the instance is confirmed mounted, so only the kept instance's onCreate
    // is ever forwarded to the user's callback.
    let beforeCreateCount = 0
    let createCount = 0
    const createdEditors = new Set<Editor>()
    let latestEditor: Editor | null = null

    function TestComponent() {
      const editor = useEditor({
        extensions: [Document, Text, Paragraph],
        onBeforeCreate: () => {
          beforeCreateCount += 1
        },
        onCreate: ({ editor: createdEditor }) => {
          createCount += 1
          createdEditors.add(createdEditor)
        },
      })

      latestEditor = editor

      return null
    }

    const { unmount } = render(
      React.createElement(React.StrictMode, null, React.createElement(TestComponent)),
    )

    // The editor's own 'create' event fires via an internal setTimeout(0);
    // give it real wall-clock time to flush.
    await flushTimers(100)

    expect(beforeCreateCount).toBeGreaterThanOrEqual(1)
    expect(createCount).toBe(1)
    expect(createdEditors.size).toBe(1)
    expect(latestEditor?.isDestroyed).toBe(false)

    unmount()
  })

  it('still fires onCreate exactly once when mounted without StrictMode', async () => {
    let createCount = 0

    function TestComponent() {
      useEditor({
        extensions: [Document, Text, Paragraph],
        onCreate: () => {
          createCount += 1
        },
      })

      return null
    }

    const { unmount } = render(React.createElement(TestComponent))

    await flushTimers(100)

    expect(createCount).toBe(1)

    unmount()
  })

  it('keeps two sibling editors independent under StrictMode', async () => {
    let createCountA = 0
    let createCountB = 0
    const createdA = new Set<Editor>()
    const createdB = new Set<Editor>()
    let editorA: Editor | null = null
    let editorB: Editor | null = null

    function ComponentA() {
      const editor = useEditor({
        extensions: [Document, Text, Paragraph],
        onCreate: ({ editor: e }) => {
          createCountA += 1
          createdA.add(e)
        },
      })

      editorA = editor

      return null
    }

    function ComponentB() {
      const editor = useEditor({
        extensions: [Document, Text, Paragraph],
        onCreate: ({ editor: e }) => {
          createCountB += 1
          createdB.add(e)
        },
      })

      editorB = editor

      return null
    }

    const { unmount } = render(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(ComponentA),
        React.createElement(ComponentB),
      ),
    )

    await flushTimers(100)

    expect(createCountA).toBe(1)
    expect(createCountB).toBe(1)
    expect(createdA.size).toBe(1)
    expect(createdB.size).toBe(1)
    expect(editorA?.isDestroyed).toBe(false)
    expect(editorB?.isDestroyed).toBe(false)
    expect(editorA).not.toBe(editorB)

    unmount()
  })

  it('does not throw and still creates exactly one editor when immediatelyRender is false under StrictMode', async () => {
    let createCount = 0

    function TestComponent() {
      useEditor({
        immediatelyRender: false,
        extensions: [Document, Text, Paragraph],
        onCreate: () => {
          createCount += 1
        },
      })

      return null
    }

    let unmount: () => void = () => {}

    expect(() => {
      ;({ unmount } = render(
        React.createElement(React.StrictMode, null, React.createElement(TestComponent)),
      ))
    }).not.toThrow()

    await flushTimers(100)

    expect(createCount).toBe(1)

    unmount()
  })

  it('handles a full unmount and remount cycle correctly under StrictMode', async () => {
    // Tracks *deltas* around the real show/hide toggle, rather than an
    // absolute destroyCount, so this stays correct regardless of exactly
    // when the guard's ref is (re-)initialized across mounts.
    let createCount = 0
    let destroyCount = 0

    function TestComponent() {
      useEditor({
        extensions: [Document, Text, Paragraph],
        onCreate: () => {
          createCount += 1
        },
        onDestroy: () => {
          destroyCount += 1
        },
      })

      return null
    }

    function Wrapper({ show }: { show: boolean }) {
      return show ? React.createElement(TestComponent) : null
    }

    const { rerender, unmount } = render(
      React.createElement(React.StrictMode, null, React.createElement(Wrapper, { show: true })),
    )

    await flushTimers(100)
    expect(createCount).toBe(1)

    const destroyCountBeforeHiding = destroyCount

    rerender(
      React.createElement(React.StrictMode, null, React.createElement(Wrapper, { show: false })),
    )
    await flushTimers(100)
    expect(destroyCount - destroyCountBeforeHiding).toBe(1)

    rerender(
      React.createElement(React.StrictMode, null, React.createElement(Wrapper, { show: true })),
    )
    await flushTimers(100)
    expect(createCount).toBe(2)

    unmount()
  })

  it('does not crash the render if a user-provided onCreate throws', async () => {
    function TestComponent() {
      useEditor({
        extensions: [Document, Text, Paragraph],
        onCreate: () => {
          throw new Error('boom from onCreate')
        },
      })

      return null
    }

    const caughtAsync: unknown[] = []
    const onUnhandled = (error: unknown) => {
      caughtAsync.push(error)
    }

    process.on('uncaughtException', onUnhandled)

    let unmount: () => void = () => {}

    try {
      expect(() => {
        ;({ unmount } = render(
          React.createElement(React.StrictMode, null, React.createElement(TestComponent)),
        ))
      }).not.toThrow()

      await flushTimers(500)
    } finally {
      unmount()
      await flushTimers(100)
      process.off('uncaughtException', onUnhandled)
    }

    // A throwing onCreate should surface asynchronously exactly once (same
    // as it would have before this fix, since it fires from a 0ms timer or
    // a React effect, never synchronously inside the render call itself) -
    // not crash the render.
    expect(caughtAsync.length).toBe(1)
    expect(caughtAsync[0]).toBeInstanceOf(Error)
    expect((caughtAsync[0] as Error).message).toBe('boom from onCreate')
  })

  it('fires onCreate exactly once per deps change under StrictMode, including the first mount', async () => {
    let createCount = 0

    function TestComponent({ depKey }: { depKey: string }) {
      useEditor(
        {
          extensions: [Document, Text, Paragraph],
          onCreate: () => {
            createCount += 1
          },
        },
        [depKey],
      )

      return null
    }

    const { rerender, unmount } = render(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(TestComponent, { depKey: 'a' }),
      ),
    )

    await flushTimers(200)
    expect(createCount).toBe(1)

    rerender(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(TestComponent, { depKey: 'b' }),
      ),
    )
    await flushTimers(200)
    expect(createCount).toBe(2)

    rerender(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(TestComponent, { depKey: 'c' }),
      ),
    )
    await flushTimers(200)
    expect(createCount).toBe(3)

    unmount()
  })
})
