import { act, render } from '@testing-library/react'
import { Node } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import React from 'react'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { EditorContent } from './EditorContent.js'
import { NodeViewWrapper } from './NodeViewWrapper.js'
import { ReactNodeViewRenderer } from './ReactNodeViewRenderer.js'
import { useEditor } from './useEditor.js'

describe('EditorContent nodeViews mount once', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('builds each custom node view once when EditorContent mounts', async () => {
    const counts = { native: 0, react: 0, reactRendered: 0 }

    const NativeBox = Node.create({
      name: 'nativeBox',
      group: 'block',
      atom: true,
      parseHTML: () => [{ tag: 'div[data-native]' }],
      renderHTML: () => ['div', { 'data-native': '' }],
      addNodeView: () => () => {
        counts.native += 1
        const dom = document.createElement('div')
        dom.textContent = 'native'
        return { dom }
      },
    })

    function ReactBoxView() {
      counts.reactRendered += 1
      return React.createElement(NodeViewWrapper, null, 'react')
    }

    const ReactBox = Node.create({
      name: 'reactBox',
      group: 'block',
      atom: true,
      parseHTML: () => [{ tag: 'div[data-react]' }],
      renderHTML: () => ['div', { 'data-react': '' }],
      addNodeView() {
        const create = ReactNodeViewRenderer(ReactBoxView)
        return props => {
          counts.react += 1
          return create(props)
        }
      },
    })

    const content = {
      type: 'doc',
      content: Array.from({ length: 100 }, (_, i) => ({
        type: i % 2 ? 'reactBox' : 'nativeBox',
      })),
    }

    function App() {
      const editor = useEditor({
        extensions: [Document, Paragraph, Text, NativeBox, ReactBox],
        content,
        immediatelyRender: true,
      })
      return React.createElement(EditorContent, { editor })
    }

    await act(async () => {
      render(React.createElement(App))
    })

    // 50 of each kind; without deferNodeViews these were 100.
    expect(counts.native).toBe(50)
    expect(counts.react).toBe(50)
    expect(counts.reactRendered).toBe(50)
  })
})
