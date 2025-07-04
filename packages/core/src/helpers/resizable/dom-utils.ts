import type { ResizableNodeViewDirections } from './types.js'

/**
 * Options for creating a DOM element
 */
interface CreateDOMElementOptions {
  /**
   * CSS classes to add to the element
   */
  classes?: string[]

  /**
   * CSS styles to apply to the element
   */
  styles?: Record<string, string>

  /**
   * HTML attributes to set on the element
   */
  attributes?: Record<string, string>

  /**
   * Dataset attributes to set on the element
   */
  dataset?: Record<string, string>

  /**
   * Child elements to append
   */
  children?: HTMLElement[]
}

/**
 * Creates a DOM element with specified properties and styles
 */
export function createDOMElement(
  tag: string,
  { classes = [], styles = {}, attributes = {}, dataset = {}, children = [] }: CreateDOMElementOptions = {},
): HTMLElement {
  const element = document.createElement(tag)

  // Add CSS classes
  if (classes.length) {
    element.classList.add(...classes)
  }

  // Add styles
  Object.entries(styles).forEach(([key, value]) => {
    element.style[key as any] = value
  })

  // Add attributes
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })

  // Add dataset properties
  Object.entries(dataset).forEach(([key, value]) => {
    element.dataset[key] = value
  })

  // Append child elements
  children.forEach(child => {
    element.appendChild(child)
  })

  return element
}

/**
 * Creates the wrapper element that contains the node and resize handles
 */
export function createWrapper(): HTMLElement {
  return createDOMElement('div', {
    styles: {
      position: 'relative',
      display: 'block',
    },
    dataset: {
      resizeWrapper: '',
    },
  })
}

/**
 * Default resize directions configuration
 */
export const defaultDirections: ResizableNodeViewDirections = {
  bottom: true,
  left: true,
  right: true,
  top: true,
  'top-left': true,
  'top-right': true,
  'bottom-left': true,
  'bottom-right': true,
}
