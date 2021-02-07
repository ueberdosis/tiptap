# Vue.js 3

## toc

## Introduction
The `@tiptap/vue` package is not yet ported to Vue 3. Meanwhile, you can find compatible version contributed by [@samwillis](https://github.com/samwillis) and [@areknawo](https://github.com/areknawo) here.

## EditorContent.ts
https://github.com/ueberdosis/tiptap-next/issues/85#issuecomment-774520164

```ts
import { defineComponent, h, ref, Teleport, onBeforeUpdate } from 'vue'
import VueRenderer from '../VueRenderer'

function setupVueRenderers(){
  const vueRenderers = ref(([] as VueRenderer[]))
  const vueRendererEls = ref(new Map())
  const addVueRenderer = (vueRenderer: VueRenderer) => {
    vueRenderers.value.push(vueRenderer)
  }
  const deleteVueRenderer = (vueRenderer: VueRenderer) => {
    const index = vueRenderers.value.indexOf(vueRenderer)
    if (index > -1) {
      vueRenderers.value.splice(index, 1)
    }
  }
  onBeforeUpdate(() => {
    vueRendererEls.value = new Map()
  })
  return {
    vueRenderers,
    vueRendererEls,
    addVueRenderer,
    deleteVueRenderer,
  }
}

export default defineComponent({
  name: 'EditorContent',

  props: {
    editor: {
      default: null,
      type: Object,
    },
  },

  setup() {
    return {
      ...setupVueRenderers(),
    }
  },

  watch: {
    editor: {
      immediate: true,
      handler(editor) {
        if (editor && editor.options.element) {
          this.$nextTick(() => {
            this.$el.appendChild(editor.options.element)
            editor.createNodeViews()
          })
        }
      },
    },
  },

  render() {
    const components = []
    for (const vueRenderer of this.vueRenderers) {
      components.push(h(
        Teleport,
        { to: vueRenderer.element },
        h(
          vueRenderer.component,
          {
            ref: (el: any) => { this.vueRendererEls.set(vueRenderer, el) },
            ...vueRenderer.props
          },
        )
      ))
    }
    return h('div', { class: 'editor-content' }, components)
  },

  beforeUnmount() {
    this.editor.setOptions({
      element: this.$el,
    })
  },
})
```

## VueRenderer.ts

https://github.com/ueberdosis/tiptap-next/issues/85#issuecomment-774520164)

```ts
import { ref, markRaw } from 'vue'
import { Editor } from '@tiptap/core'
import EditorContent from './components/EditorContent'

export interface EditorReactiveProps {
  props: any
  editor?: Editor
  element?: Element
}

export default class VueRenderer {
  private _element: Element
  private _component: any
  public props: any
  public editor: Editor

  constructor(component: any, options: EditorReactiveProps) {
    this._component = markRaw(component)
    this.props = ref(options.props || {})
    if (options.editor) {
      this.editor = options.editor
    } else {
      this.editor = options.props.editor
    }
    if (options.element) {
      this._element = options.element
    } else {
      this._element = document.createElement('div')
    }
    this.editorContent.ctx.addVueRenderer(this)
  }

  get editorContent(): typeof EditorContent {
    return (this.editor.options.element.parentElement as any).__vueParentComponent
  }

  get element() {
    return this._element
  }

  get component() {
    return this._component
  }

  get ref() {
    // This is the instance of the component,
    // you can call methods on the component from this
    return this.editorContent.ctx.vueRendererEls.get(this)
  }

  updateProps(props: { [key: string]: any } = {}) {
    Object
      .entries(props)
      .forEach(([key, value]) => {
        this.props.value[key] = value
      })
  }

  destroy() {
    this.editorContent.ctx.deleteVueRenderer(this)
  }
}
```

## BubbleMenu.ts

https://github.com/ueberdosis/tiptap-next/issues/62#issuecomment-750914155

```ts
import { Editor } from '@tiptap/core'
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

interface BubbleMenuSettings {
  bottom: number
  isActive: boolean
  left: number
  top: number
}
interface BubbleMenuPluginOptions {
  editor: Editor
  element: HTMLElement
  keepInBounds: boolean
  onUpdate(menu: BubbleMenuSettings): void
}
type DOMRectSide = 'bottom' | 'left' | 'right' | 'top'

function textRange(node: Node, from?: number, to?: number) {
  const range = document.createRange()
  range.setEnd(
    node,
    typeof to === 'number' ? to : (node.nodeValue || ').length
  )
  range.setStart(node, from || 0)
  return range
}

function singleRect(object: Range | Element, bias: number) {
  const rects = object.getClientRects()
  return !rects.length
    ? object.getBoundingClientRect()
    : rects[bias < 0 ? 0 : rects.length - 1]
}

function coordsAtPos(view: EditorView, pos: number, end = false) {
  const { node, offset } = view.domAtPos(pos) //view.docView.domFromPos(pos)
  let side: DOMRectSide | null = null
  let rect: DOMRect | null = null
  if (node.nodeType === 3) {
    const nodeValue = node.nodeValue || '
    if (end && offset < nodeValue.length) {
      rect = singleRect(textRange(node, offset - 1, offset), -1)
      side = 'right'
    } else if (offset < nodeValue.length) {
      rect = singleRect(textRange(node, offset, offset + 1), -1)
      side = 'left'
    }
  } else if (node.firstChild) {
    if (offset < node.childNodes.length) {
      const child = node.childNodes[offset]
      rect = singleRect(
        child.nodeType === 3 ? textRange(child) : (child as Element),
        -1
      )
      side = 'left'
    }
    if ((!rect || rect.top === rect.bottom) && offset) {
      const child = node.childNodes[offset - 1]
      rect = singleRect(
        child.nodeType === 3 ? textRange(child) : (child as Element),
        1
      )
      side = 'right'
    }
  } else {
    const element = node as Element
    rect = element.getBoundingClientRect()
    side = 'left'
  }

  if (rect && side) {
    const x = rect[side]

    return {
      top: rect.top,
      bottom: rect.bottom,
      left: x,
      right: x,
    }
  }
  return {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }
}

class Menu {
  public options: BubbleMenuPluginOptions
  public editorView: EditorView
  public isActive = false
  public left = 0
  public bottom = 0
  public top = 0
  public preventHide = false

  constructor({
    options,
    editorView,
  }: {
    options: BubbleMenuPluginOptions
    editorView: EditorView
  }) {
    this.options = {
      ...{
        element: null,
        keepInBounds: true,
        onUpdate: () => false,
      },
      ...options,
    }
    this.editorView = editorView
    this.options.element.addEventListener('mousedown', this.mousedownHandler, {
      capture: true,
    })
    this.options.editor.on('focus', this.focusHandler)
    this.options.editor.on('blur', this.blurHandler)
  }

  mousedownHandler = () => {
    this.preventHide = true
  }
  focusHandler = () => {
    this.update(this.options.editor.view)
  }
  blurHandler = ({ event }: { event: FocusEvent }) => {
    if (this.preventHide) {
      this.preventHide = false
      return
    }

    this.hide(event)
  }

  update(view: EditorView, lastState?: EditorState) {
    const { state } = view

    if (view.composing) {
      return
    }

    if (
      lastState &&
      lastState.doc.eq(state.doc) &&
      lastState.selection.eq(state.selection)
    ) {
      return
    }

    if (state.selection.empty) {
      this.hide()
      return
    }

    const { from, to } = state.selection
    const start = coordsAtPos(view, from)
    const end = coordsAtPos(view, to, true)
    const parent = this.options.element.offsetParent

    if (!parent) {
      this.hide()
      return
    }

    const box = parent.getBoundingClientRect()
    const el = this.options.element.getBoundingClientRect()
    const left = (start.left + end.left) / 2 - box.left

    this.left = Math.round(
      this.options.keepInBounds
        ? Math.min(box.width - el.width / 2, Math.max(left, el.width / 2))
        : left
    )
    this.bottom = Math.round(box.bottom - start.top)
    this.top = Math.round(end.bottom - box.top)
    this.isActive = true

    this.sendUpdate()
  }

  sendUpdate() {
    this.options.onUpdate({
      isActive: this.isActive,
      left: this.left,
      bottom: this.bottom,
      top: this.top,
    })
  }

  hide(event?: FocusEvent) {
    if (
      event &&
      event.relatedTarget &&
      this.options.element.parentNode &&
      this.options.element.parentNode.contains(event.relatedTarget as Node)
    ) {
      return
    }

    this.isActive = false
    this.sendUpdate()
  }

  destroy() {
    this.options.element.removeEventListener(
      'mousedown',
      this.mousedownHandler
    )
    this.options.editor.off('focus', this.focusHandler)
    this.options.editor.off('blur', this.blurHandler)
  }
}

const BubbleMenu = (options: BubbleMenuPluginOptions) => {
  return new Plugin({
    key: new PluginKey('menu_bubble'),
    view(editorView) {
      return new Menu({ editorView, options })
    },
  })
}

export { BubbleMenu }
```
