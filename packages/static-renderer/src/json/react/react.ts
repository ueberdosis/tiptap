/* oslint-disableno-explicit-any */

import React from 'react'

import type { JSONMarkType, JSONNodeType, TiptapStaticRendererOptions } from '../renderer.js'
import { TiptapStaticRenderer } from '../renderer.js'

export function renderJSONContentToReactElement<
  /**
   * A mark type is either a JSON representation of a mark or a Prosemirror mark instance
   */
  TMarkType extends { type: any } = JSONMarkType,
  /**
   * A node type is either a JSON representation of a node or a Prosemirror node instance
   */
  TNodeType extends {
    content?: { forEach: (cb: (node: TNodeType) => void) => void }
    marks?: readonly TMarkType[]
    type?: string | { name: string }
  } = JSONNodeType<TMarkType>,
>(options: TiptapStaticRendererOptions<React.ReactNode, TMarkType, TNodeType>) {
  let key = 0

  return TiptapStaticRenderer<React.ReactNode, TMarkType, TNodeType>(
    ({ component, props: { children, ...props } }) => {
      return React.createElement(
        component as React.FC<typeof props>,
        // oxlint-disable-next-line no-plusplus
        Object.assign(props, { key: key++ }),
        ([] as React.ReactNode[]).concat(children),
      )
    },
    options,
  )
}
