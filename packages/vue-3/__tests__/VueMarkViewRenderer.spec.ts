import { Editor, Mark, mergeAttributes } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'

import { MarkViewContent, markViewProps,VueMarkViewRenderer } from '../src/VueMarkViewRenderer.js'

// Create a simple Vue component for the mark view
const TestMarkComponent = defineComponent({
  name: 'TestMarkComponent',
  props: markViewProps,
  setup() {
    return {}
  },
  template: '<mark><MarkViewContent /></mark>',
  components: { MarkViewContent },
})

// Create a custom mark that uses VueMarkViewRenderer
const CustomMark = Mark.create({
  name: 'customMark',

  parseHTML() {
    return [{ tag: 'mark' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return VueMarkViewRenderer(TestMarkComponent)
  },
})

describe('VueMarkViewRenderer IME composition', () => {
  let editor: Editor | null = null
  let editorElement: HTMLElement | null = null

  beforeEach(() => {
    // Create editor element
    editorElement = document.createElement('div')
    document.body.appendChild(editorElement)
  })

  afterEach(() => {
    // Clean up
    if (editor) {
      editor.destroy()
      editor = null
    }
    if (editorElement && editorElement.parentNode) {
      editorElement.parentNode.removeChild(editorElement)
      editorElement = null
    }
  })

  it('should handle rapid content changes without errors', async () => {
    // Create editor with custom mark
    editor = new Editor({
      element: editorElement!,
      extensions: [Document, Paragraph, Text, CustomMark],
      content: '<p>This is <mark>marked text</mark> here.</p>',
    })

    // Wait for editor to initialize
    await new Promise(resolve => {
      setTimeout(() => resolve(undefined), 10)
    })

    // Get the mark view element
    const markElement = editorElement!.querySelector('mark')
    expect(markElement).toBeTruthy()

    // Rapidly change content which could trigger mark view recreation
    // This simulates what happens during IME composition
    expect(() => {
      const { tr } = editor.state
      editor.view.dispatch(tr.insertText('a', 15))
      editor.view.dispatch(editor.state.tr.insertText('b', 16))
      editor.view.dispatch(editor.state.tr.insertText('c', 17))
    }).not.toThrow()

    // Mark should still be present
    const markAfterChanges = editorElement!.querySelector('mark')
    expect(markAfterChanges).toBeTruthy()
  })

  it('should allow multiple destroy calls without errors', async () => {
    // Create editor with custom mark
    editor = new Editor({
      element: editorElement!,
      extensions: [Document, Paragraph, Text, CustomMark],
      content: '<p>This is <mark>marked text</mark> here.</p>',
    })

    await new Promise(resolve => {
      setTimeout(() => resolve(undefined), 10)
    })

    // Verify mark is rendered
    const markElement = editorElement!.querySelector('mark')
    expect(markElement).toBeTruthy()

    // Destroy editor (which destroys all mark views)
    editor.destroy()

    // Try to destroy again - should not throw
    expect(() => {
      editor!.destroy()
    }).not.toThrow()
  })

  it('should handle content replacement without errors', async () => {
    editor = new Editor({
      element: editorElement!,
      extensions: [Document, Paragraph, Text, CustomMark],
      content: '<p>This is <mark>marked text</mark> here.</p>',
    })

    await new Promise(resolve => {
      setTimeout(() => resolve(undefined), 10)
    })

    const markElement = editorElement!.querySelector('mark')
    expect(markElement).toBeTruthy()

    // Replace content entirely, which destroys and recreates mark views
    expect(() => {
      editor.commands.setContent('<p>New content with <mark>new mark</mark>!</p>')
    }).not.toThrow()

    // New mark should be present
    const newMarkElement = editorElement!.querySelector('mark')
    expect(newMarkElement).toBeTruthy()
    expect(newMarkElement?.textContent).toBe('new mark')
  })
})
