/* eslint-disable @typescript-eslint/no-explicit-any */

import type { MarkType, NodeType } from '@tiptap/core'
import { FileChild, IRunPropertiesOptions, TextRun, XmlComponent } from 'docx'

import { MarkProps, NodeProps, TiptapStaticRenderer, TiptapStaticRendererOptions } from '../renderer.js'

type MergeTypes = { type: 'run'; properties: IRunPropertiesOptions }

export type TDocxElement = XmlComponent | FileChild

export function renderJSONContentToDocxElement<
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
>(
  options: TiptapStaticRendererOptions<
    TDocxElement,
    TMarkType,
    TNodeType,
    // @ts-ignore I can't get the types to work here, but we want to add some properties to node renderers
    (
      ctx: NodeProps<TNodeType, TDocxElement | TDocxElement[]> & {
        renderInlineContent: (ctx: { content: undefined | NodeType | NodeType[] }) => TDocxElement[]
      },
    ) => TDocxElement
  > & {
    mergeMapping: Record<string, (ctx: MarkProps<TMarkType, MergeTypes, TNodeType>) => MergeTypes>
  },
) {
  options.mergeMapping = options.mergeMapping || {}

  return TiptapStaticRenderer(
    ctx => {
      return ctx.component({
        renderInlineContent({ content }: { content: undefined | NodeType | NodeType[] }): TDocxElement[] {
          if (!content || !Array.isArray(content) || content.length === 0) {
            return []
          }
          return ([] as NodeType[]).concat(content).map(node => {
            if (node.type === 'text' && !node.marks?.length) {
              return new TextRun((node as any).text)
            }
            if (node.type === 'text') {
              const runOpts = (node.marks || []).reduce((acc, mark) => {
                const merge = options.mergeMapping[typeof mark.type === 'string' ? mark.type : mark.type.name]
                if (merge) {
                  const addOptions = merge({ mark, node, parent: ctx.props.node } as any)
                  if (addOptions.type === 'run') {
                    return { ...acc, ...addOptions.properties }
                  }
                  throw new Error(`Only type: 'run' is supported for mergeMapping`)
                }
                return acc
              }, {} as IRunPropertiesOptions)

              return new TextRun({
                text: (node as any).text,
                ...runOpts,
              })
            }
            return (ctx.props as NodeProps).renderElement({ content: node, parent: ctx.props.node })
          })
        },
        ...ctx.props,
      } as any)
    },
    {
      ...options,
      markMapping: {
        ...options.markMapping,
        ...Object.keys(options.mergeMapping).reduce(
          (acc, key) => ({
            ...acc,
            // Just return the children to passthrough
            [key]: ({ children }: any) => children,
          }),
          {},
        ),
      },
    } as any,
  )
}

export function renderDocxChildrenToDocxElement(
  children: undefined | TDocxElement | TDocxElement[],
): (FileChild | XmlComponent)[] {
  if (!children) {
    return []
  }
  return ([] as (FileChild | XmlComponent)[]).concat(children)
}
