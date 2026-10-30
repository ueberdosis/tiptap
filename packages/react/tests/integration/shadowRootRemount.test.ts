import { cleanup, render } from '@testing-library/react'
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import React from 'react'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { EditorContent } from '../../src/EditorContent.js'

const hosts: HTMLElement[] = []
const editors: Editor[] = []

afterEach(() => {
  cleanup()
  editors.splice(0).forEach(editor => editor.destroy())
  hosts.splice(0).forEach(host => host.remove())
})

function createContainer(shadow: boolean) {
  const host = document.createElement('div')
  document.body.append(host)
  hosts.push(host)
  const root = shadow ? host.attachShadow({ mode: 'open' }) : host
  const container = document.createElement('div')
  root.append(container)
  return { container, root: shadow ? root : document }
}

describe('EditorContent shadow root remounts', () => {
  it.each([
    { from: 'shadow', to: 'shadow' },
    { from: 'document', to: 'shadow' },
    { from: 'shadow', to: 'document' },
  ])('uses the current selection root after $from → $to', ({ from, to }) => {
    const editor = new Editor({
      element: document.createElement('div'),
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello World</p>',
    })
    editors.push(editor)
    const first = createContainer(from === 'shadow')
    const mounted = render(React.createElement(EditorContent, { editor }), {
      container: first.container,
    })
    const firstView = editor.view
    expect(firstView.root).toBe(first.root)
    editor.commands.setTextSelection({ from: 1, to: 6 })
    mounted.unmount()

    const second = createContainer(to === 'shadow')
    render(React.createElement(EditorContent, { editor }), { container: second.container })
    expect(editor.view.dom.getRootNode()).toBe(second.root)
    expect(editor.view.root).toBe(second.root)
    expect(editor.state.selection.from).toBe(1)
    expect(editor.state.selection.to).toBe(6)
    expect(editor.getText()).toBe('Hello World')
  })
})
