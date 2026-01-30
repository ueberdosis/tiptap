import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'

import { VueRenderer } from '../src/VueRenderer.js'

describe('VueRenderer', () => {
  let editor: Editor | null = null
  let editorElement: HTMLElement | null = null

  beforeEach(() => {
    editorElement = document.createElement('div')
    document.body.appendChild(editorElement)

    editor = new Editor({
      element: editorElement,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello World</p>',
    })
  })

  afterEach(() => {
    if (editor) {
      editor.destroy()
      editor = null
    }
    if (editorElement && editorElement.parentNode) {
      editorElement.parentNode.removeChild(editorElement)
      editorElement = null
    }
  })

  it('should initialize with destroyed flag set to false', () => {
    const TestComponent = defineComponent({
      name: 'TestComponent',
      template: '<div>Test</div>',
    })

    const renderer = new VueRenderer(TestComponent, {
      editor: editor!,
      props: {},
    })

    expect(renderer.destroyed).toBe(false)

    renderer.destroy()
  })

  it('should set destroyed flag to true after destroy', () => {
    const TestComponent = defineComponent({
      name: 'TestComponent',
      template: '<div>Test</div>',
    })

    const renderer = new VueRenderer(TestComponent, {
      editor: editor!,
      props: {},
    })

    expect(renderer.destroyed).toBe(false)
    renderer.destroy()
    expect(renderer.destroyed).toBe(true)
  })

  it('should allow multiple destroy calls without errors', () => {
    const TestComponent = defineComponent({
      name: 'TestComponent',
      template: '<div>Test</div>',
    })

    const renderer = new VueRenderer(TestComponent, {
      editor: editor!,
      props: {},
    })

    expect(() => {
      renderer.destroy()
      renderer.destroy()
      renderer.destroy()
    }).not.toThrow()

    expect(renderer.destroyed).toBe(true)
  })

  it('should not update props when destroyed', () => {
    const TestComponent = defineComponent({
      name: 'TestComponent',
      props: {
        value: {
          type: String,
          default: '',
        },
      },
      template: '<div>{{ value }}</div>',
    })

    const renderer = new VueRenderer(TestComponent, {
      editor: editor!,
      props: { value: 'initial' },
    })

    expect(renderer.props.value).toBe('initial')

    renderer.destroy()
    renderer.updateProps({ value: 'updated' })

    // Props should not be updated after destroy
    expect(renderer.props.value).toBe('initial')
  })

  it('should not render when destroyed', () => {
    const TestComponent = defineComponent({
      name: 'TestComponent',
      template: '<div>Test</div>',
    })

    const renderer = new VueRenderer(TestComponent, {
      editor: editor!,
      props: {},
    })

    const originalComponent = renderer.renderedComponent

    renderer.destroy()
    const resultAfterDestroy = renderer.renderComponent()

    // Should return the same renderedComponent without re-rendering
    expect(resultAfterDestroy).toBe(originalComponent)
  })

  it('should handle props updates before destroy', () => {
    const TestComponent = defineComponent({
      name: 'TestComponent',
      props: {
        count: {
          type: Number,
          default: 0,
        },
      },
      template: '<div>{{ count }}</div>',
    })

    const renderer = new VueRenderer(TestComponent, {
      editor: editor!,
      props: { count: 0 },
    })

    expect(renderer.props.count).toBe(0)

    renderer.updateProps({ count: 5 })
    expect(renderer.props.count).toBe(5)

    renderer.updateProps({ count: 10 })
    expect(renderer.props.count).toBe(10)

    renderer.destroy()
  })

  it('should create and render element', () => {
    const TestComponent = defineComponent({
      name: 'TestComponent',
      template: '<div class="test-class">Content</div>',
    })

    const renderer = new VueRenderer(TestComponent, {
      editor: editor!,
      props: {},
    })

    expect(renderer.element).toBeTruthy()
    expect(renderer.element?.textContent).toBe('Content')

    renderer.destroy()
  })
})
