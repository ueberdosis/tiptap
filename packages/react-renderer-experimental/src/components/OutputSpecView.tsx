/** @jsxImportSource react */
import type { DOMOutputSpec } from '@tiptap/pm/model'
import type { ReactNode, Ref } from 'react'
import { createElement } from 'react'

import { attributesToProps } from '../props.js'
import { mergeRefs } from '../refs.js'

export interface OutputSpecOptions {
  /** Attached to the outermost rendered element. */
  ref: Ref<Element>
  /** Attached to the element holding the content hole (`0`), if any. */
  contentRef: Ref<HTMLElement>
  /** Rendered into the content hole. */
  children?: ReactNode
}

interface ParsedSpecElement {
  tag: string
  props: Record<string, unknown>
  childSpecs: unknown[]
  isHole: boolean
}

const isAttributeRecord = (value: unknown): value is Record<string, string> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Splits an array spec into tag, converted props, and child specs. */
const parseSpecElement = (spec: unknown[]): ParsedSpecElement => {
  const [tag, maybeAttrs, ...rest] = spec as [string, ...unknown[]]

  if (tag.includes(' ')) {
    throw new RangeError(
      '[tiptap error]: Namespaced toDOM specs are not supported by the React renderer',
    )
  }

  const hasAttrs = isAttributeRecord(maybeAttrs)
  const props = hasAttrs ? attributesToProps(maybeAttrs) : {}
  const childSpecs = hasAttrs ? rest : maybeAttrs === undefined ? [] : [maybeAttrs, ...rest]

  if (childSpecs.length > 1 && childSpecs.includes(0)) {
    throw new RangeError(
      '[tiptap error]: Content hole (0) must be the only child of its parent in a toDOM spec',
    )
  }

  return { tag, props, childSpecs, isHole: childSpecs[0] === 0 }
}

const renderSpecNode = (
  spec: DOMOutputSpec,
  options: OutputSpecOptions,
  isRoot: boolean,
): ReactNode => {
  if (typeof spec === 'string') {
    if (isRoot) {
      throw new RangeError('[tiptap error]: A node toDOM spec cannot be a bare string')
    }
    return spec
  }

  if (!Array.isArray(spec)) {
    // {dom, contentDOM} specs hold live DOM nodes, which React cannot adopt.
    // Imperative node views are handled by the migration bridge instead.
    throw new RangeError(
      '[tiptap error]: toDOM specs returning DOM nodes are not supported by the React renderer',
    )
  }

  const { tag, props, childSpecs, isHole } = parseSpecElement(spec)

  if (isHole) {
    const ref = isRoot ? mergeRefs(options.ref, options.contentRef) : options.contentRef

    return createElement(tag, { ...props, ref }, options.children)
  }

  const children = childSpecs.map(childSpec =>
    renderSpecNode(childSpec as DOMOutputSpec, options, false),
  )
  const rootProps = isRoot ? { ...props, ref: options.ref } : props

  return createElement(tag, rootProps, ...children)
}

/**
 * Renders a ProseMirror `toDOM` output spec as React elements, placing
 * `children` into the content hole and wiring `ref`/`contentRef` to the
 * outermost and content-holding elements.
 */
export const renderOutputSpec = (spec: DOMOutputSpec, options: OutputSpecOptions): ReactNode =>
  renderSpecNode(spec, options, true)
