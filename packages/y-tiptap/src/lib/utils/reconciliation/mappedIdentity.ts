import * as PModel from 'prosemirror-model'

export const mappedIdentity = (
  mapped: PModel.Node | PModel.Node[] | undefined,
  pcontent: PModel.Node | PModel.Node[],
) =>
  mapped === pcontent ||
  (mapped instanceof Array &&
    pcontent instanceof Array &&
    mapped.length === pcontent.length &&
    mapped.every((a, i) => pcontent[i] === a))
