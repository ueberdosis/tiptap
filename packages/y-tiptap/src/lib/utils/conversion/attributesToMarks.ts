import * as PModel from 'prosemirror-model'
import { yattr2markname } from './yattr2markname.js'

export const attributesToMarks = (
  attrs: Record<string, Record<string, unknown>> | undefined,
  schema: PModel.Schema,
) => {
  const marks: PModel.Mark[] = []
  for (const markName in attrs) {
    marks.push(schema.mark(yattr2markname(markName), attrs[markName]))
  }
  return marks
}
