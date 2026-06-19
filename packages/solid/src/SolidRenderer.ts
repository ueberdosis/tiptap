import type { Editor } from '@tiptap/core'
import type { Component } from 'solid-js'
import { createRoot } from 'solid-js'
import { createStore, unwrap } from 'solid-js/store'
import { Dynamic, insert } from 'solid-js/web'

import type { Editor as ExtendedEditor } from './Editor.js'
import { getRenderOwner } from './ReactiveOwner.js'

export interface SolidRendererOptions {
  editor: Editor
  props?: Record<string, unknown>
  as?: string
  className?: string
}

function trackStore<T extends Record<string, unknown>>(store: T): T {
  for (const key in store) {
    store[key]
  }

  return store
}

export class SolidRenderer {
  id: string

  editor: ExtendedEditor

  private container: HTMLElement

  element: Element | null = null

  dispose!: () => void

  private store!: Record<string, unknown>

  // oxlint-disable-next-line @typescript-eslint/no-explicit-any
  private setStore!: any

  destroyed = false

  constructor(
    component: Component,
    { editor, props = {}, as = 'div', className = '' }: SolidRendererOptions,
  ) {
    this.id = Math.floor(Math.random() * 0xffffffff).toString()
    this.editor = editor as ExtendedEditor
    this.container = document.createElement(as)

    if (className) {
      this.container.classList.add(...className.split(' '))
    }

    createRoot(dispose => {
      const [store, setStore] = createStore<Record<string, unknown>>(props)

      this.store = store
      this.setStore = setStore

      insert(this.container, () => Dynamic({ component, ...trackStore(store) }))

      this.dispose = dispose
    }, getRenderOwner(this.editor))

    this.element = this.container.firstElementChild
  }

  get props(): Record<string, unknown> {
    return unwrap(this.store)
  }

  updateProps(props: Record<string, unknown> = {}): void {
    if (this.destroyed) {
      return
    }

    for (const key of Object.keys(props)) {
      this.setStore(key, props[key])
    }
  }

  destroy(): void {
    if (this.destroyed) {
      return
    }

    this.destroyed = true
    this.dispose()
    this.element = null
  }
}
