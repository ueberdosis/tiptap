/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react'

import { MarkType, NodeType } from '../types.js'
import { TiptapStaticRenderer, TiptapStaticRendererOptions } from './renderer.js'

export function renderJSONContentToReactElement<
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
>(options: TiptapStaticRendererOptions<React.ReactNode, TMarkType, TNodeType>) {
  let key = 0

  return TiptapStaticRenderer<React.ReactNode, TMarkType, TNodeType>(
    ({ component, props: { children, ...props } }) => {
      return React.createElement(
        component as React.FC<typeof props>,
        // eslint-disable-next-line no-plusplus
        Object.assign(props, { key: key++ }),
        ([] as React.ReactNode[]).concat(children),
      )
    },
    options,
  )
}
