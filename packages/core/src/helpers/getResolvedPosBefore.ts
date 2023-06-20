import { ResolvedPos } from '@tiptap/pm/model'

export const getResolvedPosBefore = ($pos: ResolvedPos): ResolvedPos => {
  return $pos.doc.resolve($pos.start() - 1)
}
