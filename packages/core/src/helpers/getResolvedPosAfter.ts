import { ResolvedPos } from '@tiptap/pm/model'

export const getResolvedPosAfter = ($pos: ResolvedPos): ResolvedPos => {
  return $pos.doc.resolve($pos.after() + 1)
}
