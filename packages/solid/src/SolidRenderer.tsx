import type { Editor } from '@tiptap/core'
import { type Component, createRoot } from 'solid-js'
import { type SetStoreFunction, type Store, createStore } from 'solid-js/store'
import type { CustomPartial } from 'solid-js/store/types/store.js'
import { Dynamic, insert } from 'solid-js/web'

import { getTiptapSolidReactiveOwner } from './ReactiveOwner.js'

export interface SolidRendererOptions<P extends Record<string, any> = Record<string, any>> {
  /**
   * The editor instance.
   * @type {Editor}
   */
  editor: Editor

  /**
   * The props for the component.
   * @type {Record<string, any>}
   * @default {}
   */
  props?: P

  /**
   * The tag name of the element.
   * @type {string}
   * @default 'div'
   */
  as?: string

  /**
   * The class name of the element.
   * @type {string}
   * @default ''
   * @example 'foo bar'
   */
  className?: string
}

/**
 * The SolidRenderer class. It's responsible for rendering Solid components inside the editor.
 * @example
 * new SolidRenderer(MyComponent, {
 *   editor,
 *   props: {
 *     foo: 'bar',
 *   },
 *   as: 'span',
 * })
 */
export class SolidRenderer<P extends Record<string, any> = Record<string, any>> {
  id: string

  editor: Editor

  element: Element

  #dispose!: () => void

  #setProps!: SetStoreFunction<P>

  props!: Store<P>

  /**
   * Immediately creates element and renders the provided Solid component.
   */
  constructor(
    component: Component<P>,
    { editor, props = {} as P, as = 'div', className = '' }: SolidRendererOptions<P>,
  ) {
    this.id = Math.floor(Math.random() * 0xffffffff).toString()
    this.editor = editor
    this.element = document.createElement(as)
    this.element.classList.add('solid-renderer')

    if (className) {
      this.element.classList.add(...className.split(' '))
    }

    createRoot(dispose => {
      const [reactiveProps, setProps] = createStore(props)
      this.props = reactiveProps
      this.#setProps = setProps
      this.#dispose = dispose
      insert(this.element, <Dynamic component={component} {...reactiveProps} />)
    }, getTiptapSolidReactiveOwner(this.editor))
  }

  /**
   * Re-renders the Solid component with new props.
   */
  updateProps(props: CustomPartial<P>): void {
    this.#setProps(() => props)
  }

  /**
   * Destroy the Solid component.
   */
  destroy(): void {
    this.#dispose()
    this.element.remove()
  }

  /**
   * Update the attributes of the element that holds the Solid component.
   */
  updateAttributes(attributes: Record<string, string>): void {
    Object.keys(attributes).forEach(key => {
      this.element.setAttribute(key, attributes[key] as string)
    })
  }
}
