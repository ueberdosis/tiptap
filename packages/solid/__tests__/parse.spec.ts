import { Editor, Node, mergeAttributes } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, it } from 'vitest'

const createComponent = (name: string, tag: string) =>
  Node.create({
    name,
    group: 'block',
    content: 'inline*',
    parseHTML: () => [{ tag }],
    renderHTML: ({ HTMLAttributes }) => [tag, mergeAttributes(HTMLAttributes), 0],
  })

const SolidComponent = createComponent('solidComponent', 'solid-component')
const ReactComponent = createComponent('reactComponent', 'react-component')

const wrappedContent = (tag: string) => `
<p>Before</p>
<${tag}><p>Inside the node view</p></${tag}>
<p>After</p>
`

describe('component content parsing', () => {
  it.each([
    ['solidComponent', SolidComponent, 'solid-component'],
    ['reactComponent', ReactComponent, 'react-component'],
  ])('%s lifts nested paragraphs to siblings with inline* content', (name, extension, tag) => {
    const editor = new Editor({
      element: null,
      extensions: [StarterKit, extension],
      content: wrappedContent(tag),
    })

    expect(editor.state.doc.childCount).toBe(4)
    expect(editor.state.doc.child(1).type.name).toBe(name)
    expect(editor.state.doc.child(1).textContent).toBe('')
    expect(editor.state.doc.child(2).textContent).toContain('Inside the node view')

    editor.destroy()
  })

  it('keeps plain inline text inside solidComponent', () => {
    const editor = new Editor({
      element: null,
      extensions: [StarterKit, SolidComponent],
      content:
        '<solid-component>This is editable. You can create a new component by pressing Mod+Enter.</solid-component>',
    })

    expect(editor.state.doc.childCount).toBe(1)
    expect(editor.state.doc.child(0).textContent).toContain('This is editable')

    editor.destroy()
  })
})
