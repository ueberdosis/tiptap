import { act, cleanup, render } from '@testing-library/react'
import type { Editor } from '@tiptap/core'
import { Node } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { EditorContent } from '../../src/EditorContent.js'
import { NodeViewWrapper } from '../../src/NodeViewWrapper.js'
import { ReactNodeViewRenderer } from '../../src/ReactNodeViewRenderer.js'
import { useEditor } from '../../src/useEditor.js'

afterEach(cleanup)

describe('EditorContent lifecycle', () => {
  it.each([
    { strict: false, mountCount: 1, buildCount: 3 },
    { strict: true, mountCount: 2, buildCount: 6 },
  ])(
    'builds each NodeView once per mount with StrictMode=$strict',
    async ({ strict, mountCount, buildCount }) => {
      const state: { editor: Editor | null } = { editor: null }
      const destroyed = vi.fn()
      const renderer = ReactNodeViewRenderer(() =>
        React.createElement(NodeViewWrapper, null, 'Node'),
      )
      const createNodeView = vi.fn((...args: Parameters<typeof renderer>) => {
        const nodeView = renderer(...args)
        const destroy = nodeView.destroy?.bind(nodeView)
        nodeView.destroy = () => {
          destroyed()
          destroy?.()
        }
        return nodeView
      })
      const testNode = Node.create({
        name: 'lifecycleNode',
        group: 'block',
        atom: true,
        parseHTML: () => [{ tag: 'lifecycle-node' }],
        renderHTML: () => ['lifecycle-node'],
        addNodeView: () => createNodeView,
      })
      const extensions = [StarterKit, testNode]
      const mounts = vi.fn()
      const unmounts = vi.fn()
      const App = ({ visible }: { visible: boolean }) => {
        const editor = useEditor({
          extensions,
          content: '<lifecycle-node></lifecycle-node>'.repeat(3),
          onMount: mounts,
          onUnmount: unmounts,
        })
        state.editor = editor
        return visible ? React.createElement(EditorContent, { editor }) : null
      }
      const content = (visible: boolean) => {
        const app = React.createElement(App, { visible })
        return strict ? React.createElement(React.StrictMode, null, app) : app
      }
      const result = render(content(true))
      await act(async () => {})
      const editor = state.editor

      if (!editor) {
        throw new Error('Editor was not created')
      }

      expect(createNodeView).toHaveBeenCalledTimes(buildCount)
      expect(result.container.textContent).toBe('NodeNodeNode')
      expect(editor.isMounted).toBe(true)
      expect(mounts).toHaveBeenCalledTimes(mountCount)
      result.rerender(content(false))
      expect(editor.isDestroyed).toBe(false)
      expect(editor.isMounted).toBe(false)
      expect(destroyed).toHaveBeenCalledTimes(buildCount)
      expect(unmounts).toHaveBeenCalledTimes(mountCount)
      result.rerender(content(true))
      await act(async () => {})
      expect(createNodeView).toHaveBeenCalledTimes(buildCount * 2)
      expect(result.container.textContent).toBe('NodeNodeNode')
      expect(mounts).toHaveBeenCalledTimes(mountCount * 2)
    },
  )
})
