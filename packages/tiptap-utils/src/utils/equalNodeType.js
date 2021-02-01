export default function equalNodeType(nodeType, node) {
  return (Array.isArray(nodeType) && nodeType.indexOf(node.type) > -1) || node.type === nodeType
}
