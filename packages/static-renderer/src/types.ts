/* eslint-disable @typescript-eslint/no-explicit-any */

export type MarkType<
  Type extends string = any,
  Attributes extends undefined | Record<string, any> = any,
> = {
  type: Type;
  attrs: Attributes;
};

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

export type DocumentType<
  TNodeAttributes extends Record<string, any> = Record<string, any>,
  TContentType extends NodeType[] = NodeType[],
> = NodeType<'doc', TNodeAttributes, never, TContentType>;

export type TextType<TMarkType extends MarkType = MarkType> = {
  type: 'text';
  text: string;
  marks: TMarkType[];
};

export type DOMOutputSpecArray =
  | [string]
  | [string, Record<string, any>]
  | [string, 0]
  | [string, Record<string, any>, 0]
  | [string, Record<string, any>, DOMOutputSpecArray | 0]
  | [string, DOMOutputSpecArray];
