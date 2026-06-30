import { Editor, Node, mergeAttributes } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'

import { NodeViewContent } from '../src/NodeViewContent.js'
import { NodeViewWrapper } from '../src/NodeViewWrapper.js'
import {
  nodeViewProps,
  VueNodeViewRenderer,
  type VueNodeViewRendererOptions,
} from '../src/VueNodeViewRenderer.js'
import { Editor as VueEditor } from '../src/Editor.js'

const ComponentWithoutContent = defineComponent({
  name: 'WithoutContent',
  props: nodeViewProps,
  template:
    '<node-view-wrapper class="no-content"><div class="custom-content">Custom UI</div></node-view-wrapper>',
  components: { NodeViewWrapper },
})

const ComponentWithContent = defineComponent({
  name: 'WithContent',
  props: nodeViewProps,
  template:
    '<node-view-wrapper class="with-content"><node-view-content class="content-editable" /></node-view-wrapper>',
  components: { NodeViewWrapper, NodeViewContent },
})

const LeafComponent = defineComponent({
  name: 'LeafComponent',
  props: nodeViewProps,
  template:
    '<node-view-wrapper class="leaf"><div class="leaf-content">Leaf</div></node-view-wrapper>',
  components: { NodeViewWrapper },
})

function createBlockNode(
  component: ReturnType<typeof defineComponent>,
  options?: Partial<VueNodeViewRendererOptions>,
) {
  return Node.create({
    name: 'customBlock',
    group: 'block',
    content: 'inline*',
    parseHTML: () => [{ tag: 'custom-block' }],
    renderHTML: ({ HTMLAttributes }) => ['custom-block', mergeAttributes(HTMLAttributes), 0],
    addNodeView: () => VueNodeViewRenderer(component, options),
  })
}

function createLeafNode(component: ReturnType<typeof defineComponent>) {
  return Node.create({
    name: 'customLeaf',
    group: 'block',
    atom: true,
    parseHTML: () => [{ tag: 'custom-leaf' }],
    renderHTML: ({ HTMLAttributes }) => ['custom-leaf', mergeAttributes(HTMLAttributes)],
    addNodeView: () => VueNodeViewRenderer(component),
  })
}

function createVueEditor(options: ConstructorParameters<typeof VueEditor>[0]) {
  const desc = Object.getOwnPropertyDescriptor(VueEditor.prototype, 'contentComponent')
  Object.defineProperty(VueEditor.prototype, 'contentComponent', {
    value: {},
    writable: true,
    configurable: true,
  })
  const instance = new VueEditor(options)
  if (desc) Object.defineProperty(VueEditor.prototype, 'contentComponent', desc)
  else delete (VueEditor.prototype as any).contentComponent
  return instance
}

describe('VueNodeViewRenderer contentDOM', () => {
  let editor: Editor | null = null
  let el: HTMLElement | null = null

  function withEditor(
    content: string,
    component: ReturnType<typeof defineComponent>,
    leaf = false,
    options?: Partial<VueNodeViewRendererOptions>,
  ) {
    editor = createVueEditor({
      element: el!,
      extensions: [
        Document,
        Paragraph,
        Text,
        leaf ? createLeafNode(component) : createBlockNode(component, options),
      ],
      content,
    })
    return new Promise(r => setTimeout(r, 10))
  }

  beforeEach(() => {
    el = document.createElement('div')
    document.body.appendChild(el)
  })

  afterEach(() => {
    editor?.destroy()
    editor = null
    el?.parentNode?.removeChild(el)
    el = null
  })

  it('does not thrash the DOM when <node-view-content> is absent', async () => {
    await withEditor('<custom-block>Hello World</custom-block>', ComponentWithoutContent)

    // Node view wrapper should mount
    expect(el!.querySelector('[data-node-view-wrapper]')).toBeTruthy()

    // Without <node-view-content>, the contentDOMElement stays detached
    // (matching React's behavior). It exists but is not in the DOM tree.
    expect(el!.querySelector('[data-node-view-content]')).toBeFalsy()

    // Verify the internal contentDOM is not null (fixes the thrashing bug)
    const wrapperDesc = (el!.querySelector('[data-node-view-wrapper]') as any)?.pmViewDesc
    expect(wrapperDesc?.spec?.contentDOM).toBeTruthy()
  })

  it('returns null for leaf nodes', async () => {
    await withEditor('<custom-leaf />', LeafComponent, true)
    expect(el!.querySelector('[data-node-view-content]')).toBeFalsy()
  })

  it('works with <node-view-content> in the component', async () => {
    await withEditor('<custom-block>Hello World</custom-block>', ComponentWithContent)
    const content = el!.querySelector('[data-node-view-content]')
    expect(content).toBeTruthy()
    expect(content!.textContent).toContain('Hello World')
  })

  it('does not throw on destroy', async () => {
    await withEditor('<custom-block>Hello World</custom-block>', ComponentWithoutContent)
    expect(() => editor!.destroy()).not.toThrow()
  })

  it('use custom content dom element tag', async () => {
    await withEditor('<custom-block>Hello World</custom-block>', ComponentWithContent, false, {
      contentDOMElementTag: 'custom-content-dom',
    })
    const content = el!.querySelector('custom-content-dom')
    expect(content).toBeTruthy()
  })
})
