import type { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import React, { lazy, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it } from 'vite-plus/test'

import { useEditor } from './useEditor.js'

describe('useEditor', () => {
  it('does not destroy the editor before a lazy component mounts', async () => {
    const isActEnvironment = (globalThis as any).IS_REACT_ACT_ENVIRONMENT
    const root = createRoot(document.createElement('div'))

    // act() flushes effects right away, which hides the delayed commit
    ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = false

    const firstEditor = await new Promise<Editor>(resolve => {
      const Component = () => {
        const editor = useEditor({ extensions: [Document, Paragraph, Text] })

        useEffect(() => {
          resolve(editor)
        }, [editor])

        return null
      }

      const LazyComponent = lazy(() => Promise.resolve({ default: Component }))

      root.render(
        React.createElement(Suspense, { fallback: null }, React.createElement(LazyComponent)),
      )
    })

    expect(firstEditor.isDestroyed).toBe(false)

    root.unmount()
    ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = isActEnvironment
  })
})
