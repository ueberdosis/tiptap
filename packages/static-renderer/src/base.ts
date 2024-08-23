/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MarkType, NodeType } from './types'

/**
 * Props for a node renderer
 */
export type NodeProps<TNodeType = any, TChildren = any> = {
  node: TNodeType;
  children?: TChildren;
};

/**
 * Props for a mark renderer
 */
export type MarkProps<TMarkType = any, TChildren = any> = {
  mark: TMarkType;
  children?: TChildren;
};

export type TiptapStaticRendererOptions<
  /**
   * The return type of the render function (e.g. React.ReactNode, string)
   */
  TReturnType,
  /**
   * A mark type is either a JSON representation of a mark or a Prosemirror mark instance
   */
  TMarkType extends { type: any } = MarkType,
  /**
   * A node type is either a JSON representation of a node or a Prosemirror node instance
   */
  TNodeType extends {
    content?: { forEach: (cb: (node: TNodeType) => void) => void };
    marks?: readonly TMarkType[];
    type: string | { name: string };
  } = NodeType,
  /**
   * A node renderer is a function that takes a node and its children and returns the rendered output
   */
  TNodeRender extends (
    ctx: NodeProps<TNodeType, TReturnType | TReturnType[]>
  ) => TReturnType = (
    ctx: NodeProps<TNodeType, TReturnType | TReturnType[]>
  ) => TReturnType,
  /**
   * A mark renderer is a function that takes a mark and its children and returns the rendered output
   */
  TMarkRender extends (
    ctx: MarkProps<TMarkType, TReturnType | TReturnType[]>
  ) => TReturnType = (
    ctx: MarkProps<TMarkType, TReturnType | TReturnType[]>
  ) => TReturnType,
> = {
  /**
   * Mapping of node types to react components
   */
  nodeMapping: Record<string, TNodeRender>;
  /**
   * Mapping of mark types to react components
   */
  markMapping: Record<string, TMarkRender>;
  /**
   * Component to render if a node type is not handled
   */
  unhandledNode?: TNodeRender;
  /**
   * Component to render if a mark type is not handled
   */
  unhandledMark?: TMarkRender;
};

/**
 * Tiptap Static Renderer
 * ----------------------
 *
 * This function is a basis to allow for different renderers to be created.
 * Generic enough to be able to statically render Prosemirror JSON or Prosemirror Nodes.
 *
 * Using this function, you can create a renderer that takes a JSON representation of a Prosemirror document
 * and renders it using a mapping of node types to React components or even to a string.
 * This function is used as the basis to create the `reactRenderer` and `stringRenderer` functions.
 */
export function TiptapStaticRenderer<
  /**
   * The return type of the render function (e.g. React.ReactNode, string)
   */
  TReturnType,
  /**
   * A mark type is either a JSON representation of a mark or a Prosemirror mark instance
   */
  TMarkType extends { type: string | { name: string } } = MarkType,
  /**
   * A node type is either a JSON representation of a node or a Prosemirror node instance
   */
  TNodeType extends {
    content?: { forEach:(
cb: (node: TNodeType) => void) => void };
    marks?: readonly TMarkType[];
    type: string | { name: string };
  } = NodeType,
  /**
   * A node renderer is a function that takes a node and its children and returns the rendered output
   */
  TNodeRender extends (
    ctx: NodeProps<TNodeType, TReturnType | TReturnType[]>
  ) => TReturnType = (
    ctx: NodeProps<TNodeType, TReturnType | TReturnType[]>
  ) => TReturnType,
  /**
   * A mark renderer is a function that takes a mark and its children and returns the rendered output
   */
  TMarkRender extends (
    ctx: MarkProps<TMarkType, TReturnType | TReturnType[]>
  ) => TReturnType = (
    ctx: MarkProps<TMarkType, TReturnType | TReturnType[]>
  ) => TReturnType,
>(
  /**
   * The function that actually renders the component
   */
  renderComponent: (
    ctx:
      | {
          component: TNodeRender;
          props: NodeProps<TNodeType, TReturnType | TReturnType[]>;
        }
      | {
          component: TMarkRender;
          props: MarkProps<TMarkType, TReturnType | TReturnType[]>;
        }
  ) => TReturnType,
  {
    nodeMapping,
    markMapping,
    unhandledNode,
    unhandledMark,
  }: TiptapStaticRendererOptions<
    TReturnType,
    TMarkType,
    TNodeType,
    TNodeRender,
    TMarkRender
  >,
) {
  /**
   * Render Tiptap JSON and all its children using the provided node and mark mappings.
   */
  return function renderContent({
    content,
  }: {
    /**
     * Tiptap JSON content to render
     */
    content: TNodeType;
  }): TReturnType {
    // recursively render child content nodes
    const children: TReturnType[] = []

    if (content.content) {
      content.content.forEach(child => {
        children.push(
          renderContent({
            content: child,
          }),
        )
      })
    }
    const nodeType = typeof content.type === 'string' ? content.type : content.type.name
    const NodeHandler = nodeMapping[nodeType] ?? unhandledNode

    if (!NodeHandler) {
      throw new Error(`missing handler for node type ${nodeType}`)
    }

    const nodeContent = renderComponent({
      component: NodeHandler,
      props: { node: content, children },
    })

    // apply marks to the content
    const markedContent = content.marks
      ? content.marks.reduce((acc, mark) => {
        const markType = typeof mark.type === 'string' ? mark.type : mark.type.name
        const MarkHandler = markMapping[markType] ?? unhandledMark

        if (!MarkHandler) {
          throw new Error(`missing handler for mark type ${markType}`)
        }

        return renderComponent({
          component: MarkHandler,
          props: { mark, node: undefined, children: acc },
        })
      }, nodeContent)
      : nodeContent

    return markedContent
  }
}
