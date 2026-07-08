/** @jsxImportSource react */
import type { Editor } from '@tiptap/core'
import type { ComponentType } from 'react'
import { createElement } from 'react'
import type { Root } from 'react-dom/client'
import { createRoot } from 'react-dom/client'

export interface ReactRendererOptions {
  /** The editor instance. */
  editor: Editor
  /** Props passed to the component. */
  props?: Record<string, any>
  /** Tag name of the host element. @default 'div' */
  as?: string
  /** Class name(s) added to the host element. */
  className?: string
}

/**
 * Renders a React component into its own detached element and root — for UI
 * that lives outside the editor's document (suggestion/mention popups, menu
 * surfaces). The caller owns `element`: position it and attach it to the
 * DOM (e.g. `document.body`).
 *
 * Same public surface as `@tiptap/react`'s `ReactRenderer` (`element`,
 * `props`, `ref`, `updateProps`, `updateAttributes`, `destroy`), so existing
 * `suggestion.render()` code is a drop-in — but backed by a standalone
 * `createRoot` instead of a portal registry, so it needs nothing from
 * `EditorContent` and stays fully decoupled from the document renderer.
 */
export class ReactRenderer<R = unknown, P extends Record<string, any> = Record<string, any>> {
  editor: Editor

  component: ComponentType<any>

  element: HTMLElement

  props: P

  /** The rendered component's ref value (e.g. an imperative handle). */
  ref: R | null = null

  private root: Root | null

  private destroyed = false

  constructor(
    component: ComponentType<any>,
    { editor, props = {}, as = 'div', className = '' }: ReactRendererOptions,
  ) {
    this.editor = editor
    this.component = component
    this.props = props as P
    this.element = document.createElement(as)
    this.element.classList.add('react-renderer')

    if (className) {
      this.element.classList.add(...className.split(' '))
    }

    this.root = createRoot(this.element)
    this.render()
  }

  private render(): void {
    if (this.destroyed || !this.root) {
      return
    }

    const Component = this.component
    // `ref` is passed as a prop: React 19 forwards it to the component's
    // `props.ref` (used for imperative handles like a mention list's
    // `onKeyDown`)
    const props = {
      ...this.props,
      ref: (instance: R | null) => {
        this.ref = instance
      },
    }

    // Plain (batched) render — NOT flushSync: suggestion plugin views run
    // inside EditorContent's layout-effect commit, where flushSync is
    // illegal. floating-ui positioning reads the element asynchronously, so
    // the content is mounted by the time it measures.
    this.root.render(createElement(Component, props))
  }

  /** Re-renders the component with merged props. */
  updateProps(props: Record<string, any> = {}): void {
    this.props = { ...this.props, ...props }
    this.render()
  }

  /** Sets attributes on the host element. */
  updateAttributes(attributes: Record<string, string>): void {
    Object.keys(attributes).forEach(key => {
      this.element.setAttribute(key, attributes[key])
    })
  }

  /** Unmounts the component and detaches the host element. */
  destroy(): void {
    if (this.destroyed) {
      return
    }
    this.destroyed = true
    const root = this.root

    this.root = null
    // Unmount off the current task: destroy() is usually called from an
    // event handler, where a synchronous root.unmount() logs a React warning
    queueMicrotask(() => root?.unmount())
    this.element.remove()
  }
}
