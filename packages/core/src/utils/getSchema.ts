import { Schema } from 'prosemirror-model'
import { Extensions } from '../types'
import getTopNodeFromExtensions from './getTopNodeFromExtensions'
import getNodesFromExtensions from './getNodesFromExtensions'
import getMarksFromExtensions from './getMarksFromExtensions'

export default function getSchema(extensions: Extensions): Schema {
  return new Schema({
    topNode: getTopNodeFromExtensions(extensions),
    nodes: getNodesFromExtensions(extensions),
    marks: getMarksFromExtensions(extensions),
  })
}
