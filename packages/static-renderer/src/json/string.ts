/* eslint-disable @typescript-eslint/no-explicit-any */
import { MarkType, NodeType } from '../types.js'
import { TiptapStaticRenderer, TiptapStaticRendererOptions } from './renderer.js'

export function renderJSONContentToString<
/**
 * A mark type is either a JSON representation of a mark or a Prosemirror mark instance
 */
TMarkType extends { type: any } = MarkType,
/**
 * A node type is either a JSON representation of a node or a Prosemirror node instance
 */
TNodeType extends {
  content?: { forEach:(cb: (node: TNodeType) => void) => void };
  marks?: readonly TMarkType[];
  type: string | { name: string };
} = NodeType,
>(options: TiptapStaticRendererOptions<string, TMarkType, TNodeType>) {
  return TiptapStaticRenderer(ctx => {
    return ctx.component(ctx.props as any)
  }, options)
}
