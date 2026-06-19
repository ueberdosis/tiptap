import { Editor, Node, mergeAttributes } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, it } from 'vitest'
import type { Component } from 'solid-js'
import { render } from 'solid-js/web'

import { EditorContent } from '../src/EditorContent.jsx'
import { NodeViewContent } from '../src/NodeViewContent.jsx'
import { NodeViewWrapper } from '../src/NodeViewWrapper.jsx'
import { SolidNodeViewRenderer } from '../src/SolidNodeViewRenderer.jsx'

const ComponentWithContent: Component = () => (
  <NodeViewWrapper class="solid-component">
    <label contenteditable={false}>Solid Component</label>
    <NodeViewContent class="content is-editable" />
  </NodeViewWrapper>
)

const SolidComponent = Node.create({
  name: 'solidComponent',
  group: 'block',
  content: 'inline*',
  parseHTML: () => [{ tag: 'solid-component' }],
  renderHTML: ({ HTMLAttributes }) => ['solid-component', mergeAttributes(HTMLAttributes), 0],
  addNodeView: () => SolidNodeViewRenderer(ComponentWithContent),
})

describe('SolidComponentContent demo document', () => {
  it('keeps demo paragraph content inside the node view after EditorContent mounts', async () => {
    const container = document.createElement('div')

    document.body.appendChild(container)

    const editor = new Editor({
      extensions: [StarterKit, SolidComponent],
      content: `
        <p>This is still the text editor you're used to, but enriched with node views.</p>
        <solid-component>This is editable. You can create a new component by pressing Mod+Enter.</solid-component>
        <p>Did you see that? That's a Solid component. We are really living in the future.</p>
      `,
    })

    render(() => <EditorContent editor={editor} />, container)

    await new Promise(resolve => queueMicrotask(resolve))

    const contentDom = container.querySelector('[data-node-view-content-solid]')

    expect(contentDom?.textContent).toContain(
      'This is editable. You can create a new component by pressing Mod+Enter.',
    )

    const proseMirror = container.querySelector('.ProseMirror')
    const topLevelPs = Array.from(proseMirror?.children ?? []).filter(
      child => child.tagName === 'P',
    )

    expect(topLevelPs).toHaveLength(2)

    editor.destroy()
    container.remove()
  })
})
