import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import * as PModel from 'prosemirror-model'
import * as map from 'lib0/map'
import * as utils from './hashOfJSON.js'

export const marksToAttributes = (marks: readonly PModel.Mark[], meta: BindingMetadata) => {
  const pattrs: Record<string, Record<string, unknown>> = {}
  marks.forEach(mark => {
    if (mark.type.name !== 'ychange') {
      const isOverlapping = map.setIfUndefined(
        meta.isOMark,
        mark.type,
        () => !mark.type.excludes(mark.type),
      )
      // Distinct keys preserve overlapping marks of the same type with different attributes.
      pattrs[
        isOverlapping ? `${mark.type.name}--${utils.hashOfJSON(mark.toJSON())}` : mark.type.name
      ] = mark.attrs
    }
  })
  return pattrs
}
