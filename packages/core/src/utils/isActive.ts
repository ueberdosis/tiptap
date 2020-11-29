import { EditorState } from 'prosemirror-state'
import { Node, Mark } from 'prosemirror-model'
import nodeIsActive from './nodeIsActive'
import markIsActive from './markIsActive'
import objectIncludes from './objectIncludes'
import getSchemaTypeNameByName from './getSchemaTypeNameByName'

export default function isActive(state: EditorState, name: string | null, attributes: { [key: string ]: any } = {}): boolean {
  if (name) {
    const schemaType = getSchemaTypeNameByName(name, state.schema)

    if (schemaType === 'node') {
      return nodeIsActive(state, state.schema.nodes[name], attributes)
    } if (schemaType === 'mark') {
      return markIsActive(state, state.schema.marks[name], attributes)
    }
  }

  if (!name) {
    const { from, to, empty } = state.selection
    let nodes: Node[] = []
    let marks: Mark[] = []

    if (empty) {
      marks = state.selection.$head.marks()
    }

    state.doc.nodesBetween(from, to, node => {
      nodes = [...nodes, node]

      if (!empty) {
        marks = [...marks, ...node.marks]
      }
    })

    const anyNodeWithAttributes = nodes.find(node => objectIncludes(node.attrs, attributes))
    const anyMarkWithAttributes = marks.find(mark => objectIncludes(mark.attrs, attributes))

    if (anyNodeWithAttributes || anyMarkWithAttributes) {
      return true
    }
  }

  return false
}
