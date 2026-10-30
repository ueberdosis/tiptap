import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import type { App } from 'vue'
import { createApp, h, nextTick } from 'vue'

import { Editor, EditorContent } from '../../src/index.js'

const apps: App[] = []
const hosts: HTMLElement[] = []
const editors: Editor[] = []

afterEach(() => {
  apps.splice(0).forEach(app => app.unmount())
  editors.splice(0).forEach(editor => editor.destroy())
  hosts.splice(0).forEach(host => host.remove())
})

async function mount(editor: Editor, shadow: boolean) {
  const host = document.createElement('div')
  document.body.append(host)
  hosts.push(host)
  const root = shadow ? host.attachShadow({ mode: 'open' }) : host
  const container = document.createElement('div')
  root.append(container)
  const app = createApp({ render: () => h(EditorContent, { editor }) })
  apps.push(app)
  app.mount(container)
  await nextTick()
  await nextTick()
  return { app, root: shadow ? root : document }
}

describe('EditorContent shadow root remounts', () => {
  it.each([
    { from: 'shadow', to: 'shadow' },
    { from: 'document', to: 'shadow' },
    { from: 'shadow', to: 'document' },
  ])('uses the current selection root after $from → $to', async ({ from, to }) => {
    const editor = new Editor({
      element: document.createElement('div'),
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello World</p>',
    })
    editors.push(editor)
    const first = await mount(editor, from === 'shadow')
    expect(editor.view.root).toBe(first.root)
    editor.commands.setTextSelection({ from: 1, to: 6 })
    first.app.unmount()
    apps.splice(apps.indexOf(first.app), 1)

    const second = await mount(editor, to === 'shadow')
    expect(editor.view.dom.getRootNode()).toBe(second.root)
    expect(editor.view.root).toBe(second.root)
    expect(editor.state.selection.from).toBe(1)
    expect(editor.state.selection.to).toBe(6)
    expect(editor.getText()).toBe('Hello World')
  })
})
