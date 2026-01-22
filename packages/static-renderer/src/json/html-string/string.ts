/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MarkType, NodeType } from '@dibdab/core'

import type { TiptapStaticRendererOptions } from '../renderer.js'
import { TiptapStaticRenderer } from '../renderer.js'

export function renderJSONContentToString<
  /**
   * A mark type is either a JSON representation of a mark or a Prosemirror mark instance
   */
  TMarkType extends { type: any } = MarkType,
  /**
   * A node type is either a JSON representation of a node or a Prosemirror node instance
   */
  TNodeType extends {
    content?: { forEach: (cb: (node: TNodeType) => void) => void }
    marks?: readonly TMarkType[]
    type: string | { name: string }
  } = NodeType,
>(options: TiptapStaticRendererOptions<string, TMarkType, TNodeType>) {
  return TiptapStaticRenderer(ctx => {
    return ctx.component(ctx.props as any)
  }, options)
}

/**
 * Serialize the attributes of a node or mark to a string
 * @param attrs The attributes to serialize
 * @returns The serialized attributes as a string
 */
export function serializeAttrsToHTMLString(attrs: Record<string, any> | undefined | null): string {
  const output = Object.entries(attrs || {})
    .map(([key, value]) => `${key.split(' ').at(-1)}=${JSON.stringify(value)}`)
    .join(' ')

  return output ? ` ${output}` : ''
}

/**
 * Serialize the children of a node or mark to a string
 * @param children The children to serialize
 * @returns The serialized children as a string
 */
export function serializeChildrenToHTMLString(children?: string | string[]): string {
  return ([] as string[])
    .concat(children || '')
    .filter(Boolean)
    .join('')
}
