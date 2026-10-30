import { act, cleanup, render } from '@testing-library/react'
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import React, { Activity } from 'react'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { useEditor } from './useEditor.js'

const extensions = [Document, Paragraph, Text]

describe('useEditor', () => {
  afterEach(() => {
    cleanup()
  })

  it('returns null between a remount and the next effect, then a fresh instance', async () => {
    const seen: Array<Editor | null> = []
    const Probe = () => {
      const editor = useEditor({ extensions, immediatelyRender: true })

      seen.push(editor)

      return null
    }
    const App = ({ mode }: { mode: 'visible' | 'hidden' }) =>
      React.createElement(Activity, { mode }, React.createElement(Probe))

    const { rerender } = render(React.createElement(App, { mode: 'visible' }))
    const first = seen.at(-1)

    expect(first).toBeInstanceOf(Editor)

    // Hiding runs the effect cleanup; the destroy timer then disposes the
    // instance and publishes null before the reveal effect can create a new one.
    rerender(React.createElement(App, { mode: 'hidden' }))
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
    })
    rerender(React.createElement(App, { mode: 'visible' }))
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
    })

    const last = seen.at(-1)

    expect(first?.isDestroyed).toBe(true)
    expect(seen).toContain(null)
    expect(last).toBeInstanceOf(Editor)
    expect(last).not.toBe(first)
    expect(last?.isDestroyed).toBe(false)
  })

  it('returns null on the initial render when immediatelyRender is false, then an instance after the effect flushes', async () => {
    const seen: Array<Editor | null> = []
    const Probe = () => {
      const editor = useEditor({ extensions, immediatelyRender: false })

      seen.push(editor)

      return null
    }

    render(React.createElement(Probe))

    expect(seen[0]).toBe(null)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
    })

    const last = seen.at(-1)

    expect(last).toBeInstanceOf(Editor)
  })
})
