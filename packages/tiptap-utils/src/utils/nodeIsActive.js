import {
  findParentNode,
  findSelectedNodeOfType,
} from 'prosemirror-utils'

function nodeSelected(selection, type, attrs) {
  const attrKeys = Object.keys(attrs)
  const predicate = node => node.type === type
  const node = findSelectedNodeOfType(type)(selection)
    || findParentNode(predicate)(selection)

  if (!attrKeys.length || !node) {
    return !!node
  }

  if (!['paragraph', 'heading', 'blockquote', 'list_item', 'table_cell', 'table_header'].includes(type.name)) {
    return node.node.hasMarkup(type, attrs)
  }

  const nodesAttrs = Object
    .entries(node.node.attrs)
    .filter(([key]) => attrKeys.includes(key))

  return nodesAttrs.length
    && nodesAttrs.every(([key, value]) => attrs[key] === value)
}

export default function nodeIsActive({ schema, selection }, type, attrs = {}) {
  if (type.name !== 'alignment') {
    return nodeSelected(selection, type, attrs)
  }

  const {
    paragraph,
    heading,
    blockquote,
    list_item: listItem,
    table_cell: tableCell,
    table_header: tableHeader,
  } = schema.nodes

  return [
    paragraph,
    heading,
    blockquote,
    listItem,
    tableCell,
    tableHeader,
  ].some(node => nodeSelected(selection, node, attrs))
}
