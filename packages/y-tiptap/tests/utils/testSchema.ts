import { Schema } from 'prosemirror-model'
import { nodes, marks } from 'prosemirror-schema-basic'

export const schema = new Schema({
  nodes,
  marks: {
    ...marks,
    comment: {
      attrs: { id: { default: null } },
      excludes: '',
      toDOM: mark => ['comment', { comment_id: mark.attrs.id }],
    },
  },
})
