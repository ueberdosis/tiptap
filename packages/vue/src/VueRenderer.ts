import type { Editor } from '@tiptap/core'
import type { Component, DefineComponent } from 'vue'
import { h, markRaw, reactive, render } from 'vue'

import type { Editor as ExtendedEditor } from './Editor.js'

export interface VueRendererOptions {
  editor: Editor
  props?: Record<string, any>
}

type ExtendedVNode = ReturnType<typeof h> | null

interface RenderedComponent {
  vNode: ExtendedVNode
  destroy: () => void
  el: Element | null
}

// Every VueRenderer is mounted standalone via the low-level `render()` API below, so its component
// tree has no real Vue `parent` instance (`render()`'s public signature has no way to attach one).
// Vue's `useId()` relies on `instance.ids`, which is inherited *by reference* from `parent.ids` when
// a parent exists (see `createComponentInstance`) and otherwise reset to `["", 0, 0]` — so, with no
// parent, every single VueRenderer's component independently restarts its `useId()` counter at 0,
// and any two node views calling `useId()` produce the exact same sequence of ids.
//
// `appContext.config.idPrefix` (also read by `useId()`) is the one piece of that machinery `render()`
// *does* let us control per call, via a custom `vNode.appContext` — so instead of trying to fake a
// shared counter across independently-mounted trees, each renderer gets its own prefix, keeping ids
// unique *across* node views even though each one's own count still starts over at 0.
let rendererSeq = 0

/**
 * This class is used to render Vue components inside the editor.
 */
export class VueRenderer {
  renderedComponent!: RenderedComponent

  editor: ExtendedEditor

  component: Component

  el: Element | null

  props: Record<string, any>

  /**
   * Flag to track if the renderer has been destroyed, preventing queued or asynchronous renders from executing after teardown.
   */
  destroyed = false

  private readonly rendererId = rendererSeq++

  constructor(component: Component, { props = {}, editor }: VueRendererOptions) {
    this.editor = editor as ExtendedEditor
    this.component = markRaw(component)
    this.el = document.createElement('div')
    this.props = reactive(props)
    this.renderedComponent = this.renderComponent()
  }

  get element(): Element | null {
    return this.renderedComponent.el
  }

  get ref(): any {
    // Composition API
    if (this.renderedComponent.vNode?.component?.exposed) {
      return this.renderedComponent.vNode.component.exposed
    }
    // Option API
    return this.renderedComponent.vNode?.component?.proxy
  }

  renderComponent() {
    if (this.destroyed) {
      return this.renderedComponent
    }

    let vNode: ExtendedVNode = h(this.component as DefineComponent, this.props)

    if (this.editor.appContext) {
      // Known gap: if this renderer is created before `editor.appContext` is ever set (e.g. an
      // Editor constructed with a direct `element` option, never mounted through <EditorContent>),
      // this branch never runs and `vNode.appContext` is left unset — Vue then falls back to its own
      // internal `emptyAppContext` singleton for every such call, so those node views' useId() calls
      // can still collide with each other. Deriving a safe fallback context without one from
      // `editor.appContext` to copy would mean depending on Vue internals with no public API
      // equivalent (e.g. `createApp().mount()`'s private `_context`), which isn't done here.
      //
      // A shallow copy, same as EditorContent.ts already does for `provides` — this must not mutate
      // `this.editor.appContext.config` in place, since that's the real app's shared config object
      // (every node view of this editor shares the same `this.editor.appContext`).
      vNode.appContext = {
        ...this.editor.appContext,
        config: {
          ...this.editor.appContext.config,
          // useId() itself always inserts a "-" between idPrefix and the rest (`prefix + "-" + ...`,
          // see runtime-core's useId()), so this must NOT end in its own "-" or ids read "nv0--0".
          idPrefix: `${this.editor.appContext.config.idPrefix ?? ''}nv${this.rendererId}`,
        },
      }
    }
    if (typeof document !== 'undefined' && this.el) {
      render(vNode, this.el)
    }

    const destroy = () => {
      if (this.el) {
        render(null, this.el)
      }
      this.el = null
      vNode = null
    }

    return { vNode, destroy, el: this.el ? this.el.firstElementChild : null }
  }

  updateProps(props: Record<string, any> = {}): void {
    if (this.destroyed) {
      return
    }

    Object.entries(props).forEach(([key, value]) => {
      this.props[key] = value
    })
    this.renderComponent()
  }

  destroy(): void {
    if (this.destroyed) {
      return
    }

    this.destroyed = true
    this.renderedComponent.destroy()
  }
}
