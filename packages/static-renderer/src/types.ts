/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * A mark type is either a JSON representation of a mark or a Prosemirror mark instance
 */
export type MarkType<
  Type extends string = any,
  Attributes extends undefined | Record<string, any> = any,
> = {
  type: Type;
  attrs: Attributes;
};

/**
 * A node type is either a JSON representation of a node or a Prosemirror node instance
 */
export type NodeType<
  Type extends string = any,
  Attributes extends undefined | Record<string, any> = any,
  NodeMarkType extends MarkType = any,
  Content extends NodeType[] = any,
> = {
  type: Type;
  attrs: Attributes;
  content?: Content;
  marks?: NodeMarkType[];
  text?: string;
};

/**
 * A node type is either a JSON representation of a doc node or a Prosemirror doc node instance
 */
export type DocumentType<
  TNodeAttributes extends Record<string, any> = Record<string, any>,
  TContentType extends NodeType[] = NodeType[],
> = NodeType<'doc', TNodeAttributes, never, TContentType>;

/**
 * A node type is either a JSON representation of a text node or a Prosemirror text node instance
 */
export type TextType<TMarkType extends MarkType = MarkType> = {
  type: 'text';
  text: string;
  marks: TMarkType[];
};

/**
 * Describes the output of a `renderHTML` function in prosemirror
 * @see https://prosemirror.net/docs/ref/#model.DOMOutputSpec
 */
export type DOMOutputSpecArray =
  | [string]
  | [string, Record<string, any>]
  | [string, 0]
  | [string, Record<string, any>, 0]
  | [string, Record<string, any>, DOMOutputSpecArray | 0]
  | [string, DOMOutputSpecArray];
